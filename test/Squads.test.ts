import { expect } from "chai";
import { ethers } from "hardhat";
import { Squads } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Squads", function () {
  let squads: Squads;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let charlie: SignerWithAddress;

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("Squads");
    squads = await factory.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("should set owner", async function () {
      expect(await squads.owner()).to.equal(owner.address);
    });

    it("should start with zero squads", async function () {
      expect(await squads.squadCount()).to.equal(0);
    });
  });

  describe("Squad Creation", function () {
    it("should create a squad", async function () {
      await squads.createSquad("Legal", 0); // General type
      expect(await squads.squadCount()).to.equal(1);
      expect(await squads.getSquadName(1)).to.equal("Legal");
    });

    it("should create squads of different types", async function () {
      await squads.createSquad("Admissions", 1);
      await squads.createSquad("Services", 2);
      await squads.createSquad("Treasury", 3);
      expect(await squads.squadCount()).to.equal(3);
    });

    it("should revert for non-owner", async function () {
      await expect(
        squads.connect(alice).createSquad("Rogue", 0)
      ).to.be.revertedWithCustomError(squads, "OwnableUnauthorizedAccount");
    });
  });

  describe("Member Management", function () {
    beforeEach(async function () {
      await squads.createSquad("Dev", 2);
    });

    it("should add a member", async function () {
      await squads.addMember(1, alice.address);
      // Verify by creating a task (only members can)
      await squads.connect(alice).createTask(1, "Test task", 100);
    });

    it("should revert adding duplicate member", async function () {
      await squads.addMember(1, alice.address);
      await expect(squads.addMember(1, alice.address)).to.be.revertedWith(
        "Already a member"
      );
    });

    it("should revert adding to invalid squad", async function () {
      await expect(squads.addMember(99, alice.address)).to.be.revertedWith(
        "Invalid squad ID"
      );
    });

    it("should remove a member", async function () {
      await squads.addMember(1, alice.address);
      await squads.removeMember(1, alice.address);

      // Alice should no longer be able to create tasks
      await expect(
        squads.connect(alice).createTask(1, "Fail", 100)
      ).to.be.revertedWith("Not a squad member");
    });

    it("should revert removing non-member", async function () {
      await expect(squads.removeMember(1, bob.address)).to.be.revertedWith(
        "Not a member"
      );
    });

    it("should revert for non-owner calling addMember", async function () {
      await expect(
        squads.connect(alice).addMember(1, bob.address)
      ).to.be.revertedWithCustomError(squads, "OwnableUnauthorizedAccount");
    });
  });

  describe("Task Management", function () {
    beforeEach(async function () {
      await squads.createSquad("Dev", 2);
      await squads.addMember(1, alice.address);
      await squads.addMember(1, bob.address);
    });

    it("should create a task", async function () {
      await squads.connect(alice).createTask(1, "Build frontend", 500);
      // No direct getter for task, but no revert means success
    });

    it("should revert task creation by non-member", async function () {
      await expect(
        squads.connect(charlie).createTask(1, "Hack it", 999)
      ).to.be.revertedWith("Not a squad member");
    });

    it("should assign a task", async function () {
      await squads.connect(alice).createTask(1, "Build frontend", 500);
      await squads.connect(alice).assignTask(1, 1, bob.address);
    });

    it("should revert assigning to non-member", async function () {
      await squads.connect(alice).createTask(1, "Build frontend", 500);
      await expect(
        squads.connect(alice).assignTask(1, 1, charlie.address)
      ).to.be.revertedWith("Assignee not in squad");
    });

    it("should complete a task by assignee", async function () {
      await squads.connect(alice).createTask(1, "Build frontend", 500);
      await squads.connect(alice).assignTask(1, 1, bob.address);
      await squads.connect(bob).completeTask(1, 1);
    });

    it("should revert completion by non-assignee", async function () {
      await squads.connect(alice).createTask(1, "Build frontend", 500);
      await squads.connect(alice).assignTask(1, 1, bob.address);
      await expect(
        squads.connect(alice).completeTask(1, 1)
      ).to.be.revertedWith("Not assignee");
    });

    it("should revert double completion", async function () {
      await squads.connect(alice).createTask(1, "Build frontend", 500);
      await squads.connect(alice).assignTask(1, 1, bob.address);
      await squads.connect(bob).completeTask(1, 1);
      await expect(
        squads.connect(bob).completeTask(1, 1)
      ).to.be.revertedWith("Already completed");
    });
  });

  describe("Budget", function () {
    beforeEach(async function () {
      await squads.createSquad("Treasury", 3);
    });

    it("should fund squad budget by owner", async function () {
      await squads.fundSquadBudget(1, 1000);
    });

    it("should fund squad budget by hubDao", async function () {
      await squads.setHubDao(alice.address);
      await squads.connect(alice).fundSquadBudget(1, 1000);
    });

    it("should revert funding by unauthorized", async function () {
      await expect(
        squads.connect(bob).fundSquadBudget(1, 1000)
      ).to.be.revertedWith("Not authorized");
    });

    it("should revert funding invalid squad", async function () {
      await expect(squads.fundSquadBudget(99, 1000)).to.be.revertedWith(
        "Invalid squad ID"
      );
    });
  });
});
