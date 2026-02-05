import { expect } from "chai";
import { ethers } from "hardhat";
import { Fundraiser } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

// Simple ERC20 mock for contribution token
describe("Fundraiser", function () {
  let fundraiser: Fundraiser;
  let mockToken: any;
  let owner: SignerWithAddress;
  let treasury: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  const GOAL = ethers.parseEther("10000");
  const DURATION = 30 * 24 * 60 * 60; // 30 days

  beforeEach(async function () {
    [owner, treasury, alice, bob] = await ethers.getSigners();

    // Deploy a mock ERC20 (use ConsulToken as a stand-in)
    const tokenFactory = await ethers.getContractFactory("ConsulToken");
    mockToken = await tokenFactory.deploy(owner.address);
    await mockToken.mint(alice.address, ethers.parseEther("50000"));
    await mockToken.mint(bob.address, ethers.parseEther("50000"));

    // Deploy Fundraiser
    const factory = await ethers.getContractFactory("Fundraiser");
    fundraiser = await factory.deploy(
      owner.address,
      treasury.address,
      await mockToken.getAddress(),
      GOAL,
      DURATION
    );

    // Approve fundraiser
    const fundraiserAddr = await fundraiser.getAddress();
    await mockToken.connect(alice).approve(fundraiserAddr, ethers.MaxUint256);
    await mockToken.connect(bob).approve(fundraiserAddr, ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("should set correct owner", async function () {
      expect(await fundraiser.owner()).to.equal(owner.address);
    });

    it("should set correct treasury", async function () {
      expect(await fundraiser.treasury()).to.equal(treasury.address);
    });

    it("should set correct goal", async function () {
      expect(await fundraiser.goal()).to.equal(GOAL);
    });

    it("should not be live initially", async function () {
      expect(await fundraiser.isLive()).to.be.false;
    });

    it("should revert on zero treasury", async function () {
      const factory = await ethers.getContractFactory("Fundraiser");
      await expect(
        factory.deploy(owner.address, ethers.ZeroAddress, await mockToken.getAddress(), GOAL, DURATION)
      ).to.be.reverted;
    });

    it("should revert on zero goal", async function () {
      const factory = await ethers.getContractFactory("Fundraiser");
      await expect(
        factory.deploy(owner.address, treasury.address, await mockToken.getAddress(), 0, DURATION)
      ).to.be.reverted;
    });
  });

  describe("Fundraising State", function () {
    it("should toggle fundraising state", async function () {
      await fundraiser.setFundraisingState(true);
      expect(await fundraiser.isLive()).to.be.true;

      await fundraiser.setFundraisingState(false);
      expect(await fundraiser.isLive()).to.be.false;
    });

    it("should revert for non-owner", async function () {
      await expect(
        fundraiser.connect(alice).setFundraisingState(true)
      ).to.be.revertedWithCustomError(fundraiser, "OwnableUnauthorizedAccount");
    });
  });

  describe("Contributions", function () {
    beforeEach(async function () {
      await fundraiser.setFundraisingState(true);
    });

    it("should accept contributions", async function () {
      const amount = ethers.parseEther("1000");
      await fundraiser.connect(alice).contribute(amount);

      expect(await fundraiser.contributions(alice.address)).to.equal(amount);
      expect(await fundraiser.totalRaised()).to.equal(amount);
    });

    it("should accept multiple contributions from same user", async function () {
      const amount = ethers.parseEther("1000");
      await fundraiser.connect(alice).contribute(amount);
      await fundraiser.connect(alice).contribute(amount);

      expect(await fundraiser.contributions(alice.address)).to.equal(amount * 2n);
    });

    it("should revert when not live", async function () {
      await fundraiser.setFundraisingState(false);
      await expect(
        fundraiser.connect(alice).contribute(ethers.parseEther("100"))
      ).to.be.revertedWith("Fundraising not active");
    });

    it("should revert on zero amount", async function () {
      await expect(
        fundraiser.connect(alice).contribute(0)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("should revert after deadline", async function () {
      await time.increase(DURATION + 1);
      await expect(
        fundraiser.connect(alice).contribute(ethers.parseEther("100"))
      ).to.be.revertedWith("Deadline passed");
    });

    it("should revert after finalization", async function () {
      // Reach goal and finalize
      await fundraiser.connect(alice).contribute(GOAL);
      await fundraiser.forwardToTreasury();

      await expect(
        fundraiser.connect(bob).contribute(ethers.parseEther("100"))
      ).to.be.revertedWith("Already finalized");
    });
  });

  describe("Forward to Treasury", function () {
    beforeEach(async function () {
      await fundraiser.setFundraisingState(true);
    });

    it("should forward funds when goal is met", async function () {
      await fundraiser.connect(alice).contribute(GOAL);

      const balBefore = await mockToken.balanceOf(treasury.address);
      await fundraiser.forwardToTreasury();
      const balAfter = await mockToken.balanceOf(treasury.address);

      expect(balAfter - balBefore).to.equal(GOAL);
      expect(await fundraiser.finalized()).to.be.true;
    });

    it("should revert if goal not met", async function () {
      await fundraiser.connect(alice).contribute(ethers.parseEther("100"));
      await expect(fundraiser.forwardToTreasury()).to.be.revertedWith(
        "Goal not reached"
      );
    });

    it("should revert on double finalization", async function () {
      await fundraiser.connect(alice).contribute(GOAL);
      await fundraiser.forwardToTreasury();
      await expect(fundraiser.forwardToTreasury()).to.be.revertedWith(
        "Already finalized"
      );
    });

    it("should revert state change after finalization", async function () {
      await fundraiser.connect(alice).contribute(GOAL);
      await fundraiser.forwardToTreasury();
      await expect(
        fundraiser.setFundraisingState(true)
      ).to.be.revertedWith("Already finalized");
    });
  });

  describe("Refund", function () {
    beforeEach(async function () {
      await fundraiser.setFundraisingState(true);
    });

    it("should allow refund after deadline if goal not met", async function () {
      const amount = ethers.parseEther("500");
      await fundraiser.connect(alice).contribute(amount);

      const balBefore = await mockToken.balanceOf(alice.address);
      await time.increase(DURATION + 1);
      await fundraiser.connect(alice).refund();
      const balAfter = await mockToken.balanceOf(alice.address);

      expect(balAfter - balBefore).to.equal(amount);
      expect(await fundraiser.contributions(alice.address)).to.equal(0);
    });

    it("should revert refund before deadline", async function () {
      await fundraiser.connect(alice).contribute(ethers.parseEther("500"));
      await expect(
        fundraiser.connect(alice).refund()
      ).to.be.revertedWith("Deadline not reached");
    });

    it("should revert refund if goal was reached", async function () {
      await fundraiser.connect(alice).contribute(GOAL);
      await time.increase(DURATION + 1);
      await expect(
        fundraiser.connect(alice).refund()
      ).to.be.revertedWith("Goal was reached");
    });

    it("should revert refund with no contribution", async function () {
      await time.increase(DURATION + 1);
      await expect(
        fundraiser.connect(alice).refund()
      ).to.be.revertedWith("Nothing to refund");
    });
  });

  describe("Treasury Update", function () {
    it("should update treasury address", async function () {
      await fundraiser.setTreasury(bob.address);
      expect(await fundraiser.treasury()).to.equal(bob.address);
    });

    it("should revert zero address", async function () {
      await expect(
        fundraiser.setTreasury(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });
  });
});
