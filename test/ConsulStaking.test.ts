import { expect } from "chai";
import { ethers } from "hardhat";
import { ConsulToken, ConsulStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ConsulStaking", function () {
  let token: ConsulToken;
  let staking: ConsulStaking;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  const LOCK_NONE = 0;
  const LOCK_3_MONTHS = 90 * 24 * 60 * 60;
  const LOCK_6_MONTHS = 180 * 24 * 60 * 60;
  const LOCK_12_MONTHS = 365 * 24 * 60 * 60;

  const STAKE_AMOUNT = ethers.parseEther("10000");

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    // Deploy ConsulToken
    const tokenFactory = await ethers.getContractFactory("ConsulToken");
    token = await tokenFactory.deploy(owner.address);

    // Mint tokens to alice and bob
    await token.mint(alice.address, ethers.parseEther("100000"));
    await token.mint(bob.address, ethers.parseEther("100000"));

    // Deploy ConsulStaking
    const stakingFactory = await ethers.getContractFactory("ConsulStaking");
    staking = await stakingFactory.deploy(
      await token.getAddress(),
      owner.address
    );

    // Approve staking contract
    const stakingAddr = await staking.getAddress();
    await token.connect(alice).approve(stakingAddr, ethers.MaxUint256);
    await token.connect(bob).approve(stakingAddr, ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("should set correct token address", async function () {
      expect(await staking.consulToken()).to.equal(await token.getAddress());
    });

    it("should set correct owner", async function () {
      expect(await staking.owner()).to.equal(owner.address);
    });

    it("should have correct lock multipliers", async function () {
      expect(await staking.lockMultipliers(LOCK_NONE)).to.equal(10000);
      expect(await staking.lockMultipliers(LOCK_3_MONTHS)).to.equal(12500);
      expect(await staking.lockMultipliers(LOCK_6_MONTHS)).to.equal(15000);
      expect(await staking.lockMultipliers(LOCK_12_MONTHS)).to.equal(20000);
    });

    it("should revert on zero token address", async function () {
      const factory = await ethers.getContractFactory("ConsulStaking");
      await expect(
        factory.deploy(ethers.ZeroAddress, owner.address)
      ).to.be.reverted;
    });
  });

  describe("Staking", function () {
    it("should stake with no lock", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_NONE);
      expect(await staking.totalStaked()).to.equal(STAKE_AMOUNT);

      const info = await staking.getStakeInfo(alice.address);
      expect(info.amount).to.equal(STAKE_AMOUNT);
      expect(info.lockEnd).to.equal(0);
    });

    it("should stake with 12 month lock", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_12_MONTHS);
      const info = await staking.getStakeInfo(alice.address);
      expect(info.amount).to.equal(STAKE_AMOUNT);
      expect(info.lockDuration).to.equal(LOCK_12_MONTHS);
    });

    it("should revert on zero amount", async function () {
      await expect(
        staking.connect(alice).stake(0, LOCK_NONE)
      ).to.be.revertedWithCustomError(staking, "ZeroAmount");
    });

    it("should revert on invalid lock duration", async function () {
      await expect(
        staking.connect(alice).stake(STAKE_AMOUNT, 12345)
      ).to.be.revertedWithCustomError(staking, "InvalidLockDuration");
    });

    it("should add to existing stake", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_NONE);
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_NONE);

      const info = await staking.getStakeInfo(alice.address);
      expect(info.amount).to.equal(STAKE_AMOUNT * 2n);
    });

    it("should preserve longer lock when adding stake with shorter lock", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_12_MONTHS);
      const info1 = await staking.getStakeInfo(alice.address);
      const originalLockEnd = info1.lockEnd;

      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_NONE);
      const info2 = await staking.getStakeInfo(alice.address);
      expect(info2.lockEnd).to.equal(originalLockEnd);
      expect(info2.lockDuration).to.equal(LOCK_12_MONTHS);
    });
  });

  describe("Unstaking", function () {
    it("should unstake flexible stake anytime", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_NONE);
      await staking.connect(alice).unstake(STAKE_AMOUNT);

      expect(await staking.totalStaked()).to.equal(0);
      const info = await staking.getStakeInfo(alice.address);
      expect(info.amount).to.equal(0);
    });

    it("should revert unstake during lock period", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
      await expect(
        staking.connect(alice).unstake(STAKE_AMOUNT)
      ).to.be.revertedWithCustomError(staking, "StillLocked");
    });

    it("should allow unstake after lock expires", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
      await time.increase(LOCK_3_MONTHS + 1);
      await staking.connect(alice).unstake(STAKE_AMOUNT);

      expect(await staking.totalStaked()).to.equal(0);
    });

    it("should revert on no stake", async function () {
      await expect(
        staking.connect(alice).unstake(STAKE_AMOUNT)
      ).to.be.revertedWithCustomError(staking, "NoStake");
    });

    it("should revert if amount exceeds staked", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_NONE);
      await expect(
        staking.connect(alice).unstake(STAKE_AMOUNT + 1n)
      ).to.be.revertedWithCustomError(staking, "InsufficientBalance");
    });

    it("should allow partial unstake", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_NONE);
      const half = STAKE_AMOUNT / 2n;
      await staking.connect(alice).unstake(half);

      const info = await staking.getStakeInfo(alice.address);
      expect(info.amount).to.equal(half);
    });
  });

  describe("Voting Power", function () {
    it("should return 0 for no stake", async function () {
      expect(await staking.getVotingPower(alice.address)).to.equal(0);
    });

    it("should return 1x for no lock", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_NONE);
      expect(await staking.getVotingPower(alice.address)).to.equal(STAKE_AMOUNT);
    });

    it("should return 1.25x for 3 month lock", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
      const expected = (STAKE_AMOUNT * 12500n) / 10000n;
      expect(await staking.getVotingPower(alice.address)).to.equal(expected);
    });

    it("should return 2x for 12 month lock", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_12_MONTHS);
      const expected = (STAKE_AMOUNT * 20000n) / 10000n;
      expect(await staking.getVotingPower(alice.address)).to.equal(expected);
    });

    it("should decay to 1x after lock expires", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_12_MONTHS);

      // Before expiry: 2x
      const before = await staking.getVotingPower(alice.address);
      expect(before).to.equal(STAKE_AMOUNT * 2n);

      // After expiry: 1x
      await time.increase(LOCK_12_MONTHS + 1);
      const after = await staking.getVotingPower(alice.address);
      expect(after).to.equal(STAKE_AMOUNT);
    });
  });

  describe("Extend Lock", function () {
    it("should extend lock duration", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_3_MONTHS);
      await staking.connect(alice).extendLock(LOCK_12_MONTHS);

      const info = await staking.getStakeInfo(alice.address);
      expect(info.lockDuration).to.equal(LOCK_12_MONTHS);
    });

    it("should revert on shortening lock", async function () {
      await staking.connect(alice).stake(STAKE_AMOUNT, LOCK_12_MONTHS);
      await expect(
        staking.connect(alice).extendLock(LOCK_3_MONTHS)
      ).to.be.reverted;
    });

    it("should revert with no stake", async function () {
      await expect(
        staking.connect(alice).extendLock(LOCK_3_MONTHS)
      ).to.be.revertedWithCustomError(staking, "NoStake");
    });
  });
});
