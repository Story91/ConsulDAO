import { expect } from "chai";
import { ethers } from "hardhat";
import { ConsulToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ConsulToken", function () {
  let token: ConsulToken;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ConsulToken");
    token = await factory.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("should set name and symbol", async function () {
      expect(await token.name()).to.equal("ConsulDAO");
      expect(await token.symbol()).to.equal("CONSUL");
    });

    it("should set owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("should have zero initial supply", async function () {
      expect(await token.totalSupply()).to.equal(0);
    });

    it("should have correct MAX_SUPPLY", async function () {
      expect(await token.MAX_SUPPLY()).to.equal(ethers.parseEther("100000000"));
    });

    it("should revert on zero-address owner", async function () {
      const factory = await ethers.getContractFactory("ConsulToken");
      await expect(factory.deploy(ethers.ZeroAddress)).to.be.reverted;
    });
  });

  describe("initialMint", function () {
    it("should mint tokens to recipient", async function () {
      const amount = ethers.parseEther("50000000");
      await token.initialMint(alice.address, amount);
      expect(await token.balanceOf(alice.address)).to.equal(amount);
      expect(await token.totalSupply()).to.equal(amount);
    });

    it("should set initialMintDone", async function () {
      await token.initialMint(alice.address, ethers.parseEther("1000"));
      expect(await token.initialMintDone()).to.be.true;
    });

    it("should revert on second call", async function () {
      await token.initialMint(alice.address, ethers.parseEther("1000"));
      await expect(
        token.initialMint(bob.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(token, "InitialMintAlreadyDone");
    });

    it("should revert if amount exceeds MAX_SUPPLY", async function () {
      const tooMuch = ethers.parseEther("100000001");
      await expect(
        token.initialMint(alice.address, tooMuch)
      ).to.be.revertedWithCustomError(token, "MaxSupplyExceeded");
    });

    it("should revert for non-owner", async function () {
      await expect(
        token.connect(alice).initialMint(alice.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("mint", function () {
    it("should mint within supply cap", async function () {
      await token.mint(alice.address, ethers.parseEther("1000"));
      expect(await token.balanceOf(alice.address)).to.equal(ethers.parseEther("1000"));
    });

    it("should revert if exceeds MAX_SUPPLY", async function () {
      await token.initialMint(owner.address, ethers.parseEther("100000000"));
      await expect(
        token.mint(alice.address, 1)
      ).to.be.revertedWithCustomError(token, "MaxSupplyExceeded");
    });

    it("should revert for non-owner", async function () {
      await expect(
        token.connect(alice).mint(alice.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("burn", function () {
    it("should burn tokens and reduce totalSupply", async function () {
      await token.mint(owner.address, ethers.parseEther("1000"));
      await token.burn(ethers.parseEther("400"));
      expect(await token.totalSupply()).to.equal(ethers.parseEther("600"));
    });
  });

  describe("delegation", function () {
    it("should support vote delegation", async function () {
      await token.mint(alice.address, ethers.parseEther("1000"));
      await token.connect(alice).delegate(alice.address);
      expect(await token.getVotes(alice.address)).to.equal(ethers.parseEther("1000"));
    });
  });
});
