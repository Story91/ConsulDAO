import { expect } from "chai";
import { ethers } from "hardhat";
import { HubDAO, ConsulToken, ConsulStaking } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("HubDAO", function () {
  let hubDao: HubDAO;
  let usdc: ConsulToken; // Using ConsulToken as a mock ERC20 for USDC
  let consulToken: ConsulToken;
  let staking: ConsulStaking;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let recipient: SignerWithAddress;

  const BUDGET_AMOUNT = ethers.parseEther("10000");

  beforeEach(async function () {
    [owner, alice, bob, recipient] = await ethers.getSigners();

    // Deploy mock USDC (using ConsulToken)
    const tokenFactory = await ethers.getContractFactory("ConsulToken");
    usdc = await tokenFactory.deploy(owner.address);
    consulToken = await tokenFactory.deploy(owner.address);

    // Deploy staking
    const stakingFactory = await ethers.getContractFactory("ConsulStaking");
    staking = await stakingFactory.deploy(
      await consulToken.getAddress(),
      owner.address
    );

    // Deploy HubDAO
    const hubFactory = await ethers.getContractFactory("HubDAO");
    hubDao = await hubFactory.deploy(
      await usdc.getAddress(),
      owner.address
    );

    // Configure staking in HubDAO
    await hubDao.setStakingContract(await staking.getAddress());

    // Fund HubDAO treasury with USDC
    await usdc.mint(await hubDao.getAddress(), ethers.parseEther("100000"));

    // Give alice and bob staking tokens
    await consulToken.mint(alice.address, ethers.parseEther("50000"));
    await consulToken.mint(bob.address, ethers.parseEther("50000"));

    // Approve staking
    const stakingAddr = await staking.getAddress();
    await consulToken.connect(alice).approve(stakingAddr, ethers.MaxUint256);
    await consulToken.connect(bob).approve(stakingAddr, ethers.MaxUint256);
  });

  describe("Deployment", function () {
    it("should set treasury token", async function () {
      expect(await hubDao.treasuryToken()).to.equal(await usdc.getAddress());
    });

    it("should set owner", async function () {
      expect(await hubDao.owner()).to.equal(owner.address);
    });

    it("should revert on zero treasury token", async function () {
      const factory = await ethers.getContractFactory("HubDAO");
      await expect(
        factory.deploy(ethers.ZeroAddress, owner.address)
      ).to.be.reverted;
    });
  });

  describe("Budget Proposal", function () {
    it("should propose a budget", async function () {
      // Need stakers first so totalStaked > 0
      await staking.connect(alice).stake(ethers.parseEther("1000"), 0);

      await hubDao.proposeBudget(BUDGET_AMOUNT);
      expect(await hubDao.currentQuarter()).to.equal(1);
    });

    it("should revert for non-owner", async function () {
      await expect(
        hubDao.connect(alice).proposeBudget(BUDGET_AMOUNT)
      ).to.be.revertedWithCustomError(hubDao, "OwnableUnauthorizedAccount");
    });

    it("should revert if staking not configured", async function () {
      const factory = await ethers.getContractFactory("HubDAO");
      const freshDao = await factory.deploy(await usdc.getAddress(), owner.address);
      await expect(
        freshDao.proposeBudget(BUDGET_AMOUNT)
      ).to.be.revertedWith("Staking not configured");
    });

    it("should snapshot totalStaked at proposal time", async function () {
      await staking.connect(alice).stake(ethers.parseEther("5000"), 0);
      await hubDao.proposeBudget(BUDGET_AMOUNT);

      const budget = await hubDao.quarterlyBudgets(1);
      expect(budget.snapshotTotalStaked).to.equal(ethers.parseEther("5000"));
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      // Stake tokens
      await staking.connect(alice).stake(ethers.parseEther("30000"), 0);
      await staking.connect(bob).stake(ethers.parseEther("20000"), 0);

      // Propose budget
      await hubDao.proposeBudget(BUDGET_AMOUNT);
    });

    it("should accept vote from staker", async function () {
      await hubDao.connect(alice).voteOnBudget(1, true);
    });

    it("should revert vote from non-staker", async function () {
      await expect(
        hubDao.connect(recipient).voteOnBudget(1, true)
      ).to.be.revertedWith("No voting power");
    });

    it("should revert double vote", async function () {
      await hubDao.connect(alice).voteOnBudget(1, true);
      await expect(
        hubDao.connect(alice).voteOnBudget(1, true)
      ).to.be.revertedWith("Already voted");
    });

    it("should revert vote after period ended", async function () {
      await time.increase(91 * 24 * 60 * 60); // > 90 days
      await expect(
        hubDao.connect(alice).voteOnBudget(1, true)
      ).to.be.revertedWith("Voting period ended");
    });
  });

  describe("Budget Approval", function () {
    beforeEach(async function () {
      // Alice stakes 30k, Bob stakes 20k (total 50k)
      await staking.connect(alice).stake(ethers.parseEther("30000"), 0);
      await staking.connect(bob).stake(ethers.parseEther("20000"), 0);

      await hubDao.proposeBudget(BUDGET_AMOUNT);
    });

    it("should approve when >= 50% vote power supports", async function () {
      // Alice has 30k/50k = 60% → sufficient
      await hubDao.connect(alice).voteOnBudget(1, true);
      await hubDao.approveBudget(1);

      const budget = await hubDao.quarterlyBudgets(1);
      expect(budget.approved).to.be.true;
    });

    it("should reject when < 50% vote power supports", async function () {
      // Bob has 20k/50k = 40% → insufficient
      await hubDao.connect(bob).voteOnBudget(1, true);
      await expect(hubDao.approveBudget(1)).to.be.revertedWith(
        "Insufficient vote power"
      );
    });

    it("should revert if already approved", async function () {
      await hubDao.connect(alice).voteOnBudget(1, true);
      await hubDao.approveBudget(1);
      await expect(hubDao.approveBudget(1)).to.be.revertedWith(
        "Already approved"
      );
    });
  });

  describe("Budget Execution", function () {
    beforeEach(async function () {
      await staking.connect(alice).stake(ethers.parseEther("30000"), 0);
      await staking.connect(bob).stake(ethers.parseEther("20000"), 0);
      await hubDao.proposeBudget(BUDGET_AMOUNT);
      await hubDao.connect(alice).voteOnBudget(1, true);
      await hubDao.approveBudget(1);
    });

    it("should execute budget payment", async function () {
      const amount = ethers.parseEther("1000");
      const balBefore = await usdc.balanceOf(recipient.address);
      await hubDao.executeBudget(1, recipient.address, amount);
      const balAfter = await usdc.balanceOf(recipient.address);

      expect(balAfter - balBefore).to.equal(amount);
    });

    it("should track spent amount", async function () {
      const amount = ethers.parseEther("1000");
      await hubDao.executeBudget(1, recipient.address, amount);

      const budget = await hubDao.quarterlyBudgets(1);
      expect(budget.spent).to.equal(amount);
    });

    it("should revert if exceeds remaining budget", async function () {
      await hubDao.executeBudget(1, recipient.address, BUDGET_AMOUNT);
      await expect(
        hubDao.executeBudget(1, recipient.address, 1)
      ).to.be.revertedWith("Amount exceeds remaining budget");
    });

    it("should revert if not approved", async function () {
      await hubDao.proposeBudget(BUDGET_AMOUNT); // Quarter 2 (not approved)
      await expect(
        hubDao.executeBudget(2, recipient.address, 1000)
      ).to.be.revertedWith("Budget not approved");
    });

    it("should revert for non-owner", async function () {
      await expect(
        hubDao.connect(alice).executeBudget(1, recipient.address, 1000)
      ).to.be.revertedWithCustomError(hubDao, "OwnableUnauthorizedAccount");
    });
  });

  describe("Veto", function () {
    beforeEach(async function () {
      await staking.connect(alice).stake(ethers.parseEther("30000"), 0);
      await hubDao.proposeBudget(BUDGET_AMOUNT);
      await hubDao.connect(alice).voteOnBudget(1, true);
      await hubDao.approveBudget(1);
    });

    it("should veto an approved budget", async function () {
      await hubDao.setVetoPower(bob.address, true);
      await hubDao.connect(bob).vetoBudget(1);

      const budget = await hubDao.quarterlyBudgets(1);
      expect(budget.approved).to.be.false;
    });

    it("should revert veto from unauthorized", async function () {
      await expect(
        hubDao.connect(bob).vetoBudget(1)
      ).to.be.revertedWith("Not authorized to veto");
    });
  });

  describe("Governance Config", function () {
    it("should set staking contract", async function () {
      const newAddr = bob.address;
      await hubDao.setStakingContract(newAddr);
      expect(await hubDao.stakingContract()).to.equal(newAddr);
    });

    it("should revert zero staking contract", async function () {
      await expect(
        hubDao.setStakingContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("should set buyback contract", async function () {
      await hubDao.setBuybackContract(bob.address);
      expect(await hubDao.buybackContract()).to.equal(bob.address);
    });

    it("should revert zero buyback contract", async function () {
      await expect(
        hubDao.setBuybackContract(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("should report voting power through staking", async function () {
      await staking.connect(alice).stake(ethers.parseEther("1000"), 0);
      const power = await hubDao.getVotingPower(alice.address);
      expect(power).to.equal(ethers.parseEther("1000"));
    });

    it("should return 0 voting power without staking contract", async function () {
      const factory = await ethers.getContractFactory("HubDAO");
      const freshDao = await factory.deploy(await usdc.getAddress(), owner.address);
      expect(await freshDao.getVotingPower(alice.address)).to.equal(0);
    });
  });

  describe("Treasury", function () {
    it("should report treasury balance", async function () {
      const balance = await hubDao.getTreasuryBalance();
      expect(balance).to.equal(ethers.parseEther("100000"));
    });
  });
});
