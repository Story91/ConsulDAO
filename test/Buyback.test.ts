import { expect } from "chai";
import { ethers } from "hardhat";
import { Buyback, ConsulToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Buyback", function () {
  let buyback: Buyback;
  let usdc: ConsulToken;
  let consulToken: ConsulToken;
  let mockRouter: any;
  let owner: SignerWithAddress;
  let hubDao: SignerWithAddress;
  let alice: SignerWithAddress;

  const USDC_AMOUNT = ethers.parseEther("1000");

  beforeEach(async function () {
    [owner, hubDao, alice] = await ethers.getSigners();

    // Deploy tokens
    const tokenFactory = await ethers.getContractFactory("ConsulToken");
    usdc = await tokenFactory.deploy(owner.address);
    consulToken = await tokenFactory.deploy(owner.address);

    // Deploy mock swap router
    const routerFactory = await ethers.getContractFactory("MockSwapRouter");
    mockRouter = await routerFactory.deploy();

    // Deploy Buyback
    const buybackFactory = await ethers.getContractFactory("Buyback");
    buyback = await buybackFactory.deploy(
      await usdc.getAddress(),
      await consulToken.getAddress(),
      hubDao.address,
      owner.address
    );

    // Configure DEX router
    await buyback.setDexRouter(await mockRouter.getAddress());

    // Fund buyback contract with USDC
    await usdc.mint(await buyback.getAddress(), ethers.parseEther("50000"));

    // Fund mock router with CONSUL (so it can "swap")
    await consulToken.mint(await mockRouter.getAddress(), ethers.parseEther("50000"));
  });

  describe("Deployment", function () {
    it("should set correct addresses", async function () {
      expect(await buyback.usdc()).to.equal(await usdc.getAddress());
      expect(await buyback.consulToken()).to.equal(await consulToken.getAddress());
      expect(await buyback.hubDao()).to.equal(hubDao.address);
    });

    it("should revert on zero USDC address", async function () {
      const factory = await ethers.getContractFactory("Buyback");
      await expect(
        factory.deploy(ethers.ZeroAddress, await consulToken.getAddress(), hubDao.address, owner.address)
      ).to.be.reverted;
    });

    it("should revert on zero CONSUL address", async function () {
      const factory = await ethers.getContractFactory("Buyback");
      await expect(
        factory.deploy(await usdc.getAddress(), ethers.ZeroAddress, hubDao.address, owner.address)
      ).to.be.reverted;
    });

    it("should revert on zero HubDAO address", async function () {
      const factory = await ethers.getContractFactory("Buyback");
      await expect(
        factory.deploy(await usdc.getAddress(), await consulToken.getAddress(), ethers.ZeroAddress, owner.address)
      ).to.be.reverted;
    });
  });

  describe("Execute Buyback", function () {
    it("should execute buyback successfully", async function () {
      await buyback.connect(hubDao).executeBuyback(USDC_AMOUNT, 0);

      expect(await buyback.totalBuybackSpent()).to.equal(USDC_AMOUNT);
      expect(await buyback.totalBurned()).to.equal(USDC_AMOUNT); // 1:1 rate
    });

    it("should revert for non-hubDao caller", async function () {
      await expect(
        buyback.connect(alice).executeBuyback(USDC_AMOUNT, 0)
      ).to.be.revertedWithCustomError(buyback, "OnlyHubDao");
    });

    it("should revert on zero amount", async function () {
      await expect(
        buyback.connect(hubDao).executeBuyback(0, 0)
      ).to.be.revertedWithCustomError(buyback, "ZeroAmount");
    });

    it("should revert on insufficient USDC balance", async function () {
      const tooMuch = ethers.parseEther("999999");
      await expect(
        buyback.connect(hubDao).executeBuyback(tooMuch, 0)
      ).to.be.revertedWithCustomError(buyback, "InsufficientBalance");
    });

    it("should revert if dex router not set", async function () {
      // Deploy fresh buyback without router
      const factory = await ethers.getContractFactory("Buyback");
      const freshBuyback = await factory.deploy(
        await usdc.getAddress(),
        await consulToken.getAddress(),
        hubDao.address,
        owner.address
      );
      await usdc.mint(await freshBuyback.getAddress(), USDC_AMOUNT);

      await expect(
        freshBuyback.connect(hubDao).executeBuyback(USDC_AMOUNT, 0)
      ).to.be.revertedWithCustomError(freshBuyback, "DexRouterNotSet");
    });
  });

  describe("Stats", function () {
    it("should track buyback stats", async function () {
      await buyback.connect(hubDao).executeBuyback(USDC_AMOUNT, 0);

      const stats = await buyback.getBuybackStats();
      expect(stats.usdcSpent).to.equal(USDC_AMOUNT);
      expect(stats.consulBurned).to.equal(USDC_AMOUNT); // 1:1 rate
    });
  });

  describe("Admin", function () {
    it("should update hubDao address", async function () {
      await buyback.setHubDao(alice.address);
      expect(await buyback.hubDao()).to.equal(alice.address);
    });

    it("should revert zero hubDao address", async function () {
      await expect(
        buyback.setHubDao(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("should update dex router", async function () {
      await buyback.setDexRouter(alice.address);
      expect(await buyback.dexRouter()).to.equal(alice.address);
    });

    it("should set valid pool fee tiers", async function () {
      await buyback.setPoolFee(100);
      expect(await buyback.poolFee()).to.equal(100);

      await buyback.setPoolFee(500);
      expect(await buyback.poolFee()).to.equal(500);

      await buyback.setPoolFee(10000);
      expect(await buyback.poolFee()).to.equal(10000);
    });

    it("should revert invalid pool fee tier", async function () {
      await expect(buyback.setPoolFee(999)).to.be.revertedWith(
        "Invalid fee tier"
      );
    });

    it("should deposit USDC", async function () {
      await usdc.mint(alice.address, USDC_AMOUNT);
      await usdc.connect(alice).approve(await buyback.getAddress(), USDC_AMOUNT);
      await buyback.connect(alice).depositUsdc(USDC_AMOUNT);
    });

    it("should emergency withdraw", async function () {
      const balBefore = await usdc.balanceOf(owner.address);
      await buyback.emergencyWithdraw(await usdc.getAddress(), USDC_AMOUNT);
      const balAfter = await usdc.balanceOf(owner.address);
      expect(balAfter - balBefore).to.equal(USDC_AMOUNT);
    });
  });
});
