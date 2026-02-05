import { expect } from "chai";
import { ethers } from "hardhat";
import { ProjectRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ProjectRegistry", function () {
  let registry: ProjectRegistry;
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("ProjectRegistry");
    registry = await factory.deploy();
  });

  describe("Registration", function () {
    it("should register a project", async function () {
      await registry.connect(alice).registerProject("myproject", '{"desc":"A cool project"}');

      const project = await registry.getProject("myproject");
      expect(project.projectName).to.equal("myproject");
      expect(project.founder).to.equal(alice.address);
      expect(project.exists).to.be.true;
    });

    it("should increment totalProjects", async function () {
      await registry.registerProject("proj1", "{}");
      await registry.connect(alice).registerProject("proj2", "{}");
      expect(await registry.totalProjects()).to.equal(2);
    });

    it("should revert on duplicate name", async function () {
      await registry.registerProject("taken", "{}");
      await expect(
        registry.connect(alice).registerProject("taken", "{}")
      ).to.be.revertedWithCustomError(registry, "ProjectAlreadyExists");
    });

    it("should revert on empty name", async function () {
      await expect(
        registry.registerProject("", "{}")
      ).to.be.revertedWithCustomError(registry, "InvalidName");
    });

    it("should revert on name > 32 bytes", async function () {
      const longName = "a".repeat(33);
      await expect(
        registry.registerProject(longName, "{}")
      ).to.be.revertedWithCustomError(registry, "InvalidName");
    });
  });

  describe("Update Manifest", function () {
    beforeEach(async function () {
      await registry.connect(alice).registerProject("myproject", '{"v":1}');
    });

    it("should update manifest by founder", async function () {
      await registry.connect(alice).updateManifest("myproject", '{"v":2}');
      const project = await registry.getProject("myproject");
      expect(project.manifest).to.equal('{"v":2}');
    });

    it("should revert update by non-founder", async function () {
      await expect(
        registry.connect(bob).updateManifest("myproject", '{"hack":true}')
      ).to.be.revertedWithCustomError(registry, "NotProjectOwner");
    });

    it("should revert update for non-existent project", async function () {
      await expect(
        registry.updateManifest("ghost", "{}")
      ).to.be.revertedWithCustomError(registry, "ProjectNotFound");
    });
  });

  describe("Transfer Ownership", function () {
    beforeEach(async function () {
      await registry.connect(alice).registerProject("myproject", "{}");
    });

    it("should transfer project ownership", async function () {
      await registry.connect(alice).transferProjectOwnership("myproject", bob.address);

      const project = await registry.getProject("myproject");
      expect(project.founder).to.equal(bob.address);
    });

    it("should update founder project lists", async function () {
      await registry.connect(alice).transferProjectOwnership("myproject", bob.address);

      const aliceProjects = await registry.getProjectsByFounder(alice.address);
      const bobProjects = await registry.getProjectsByFounder(bob.address);

      expect(aliceProjects.length).to.equal(0);
      expect(bobProjects.length).to.equal(1);
      expect(bobProjects[0]).to.equal("myproject");
    });

    it("should revert transfer by non-owner", async function () {
      await expect(
        registry.connect(bob).transferProjectOwnership("myproject", bob.address)
      ).to.be.revertedWithCustomError(registry, "NotProjectOwner");
    });

    it("should revert transfer to zero address", async function () {
      await expect(
        registry.connect(alice).transferProjectOwnership("myproject", ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(registry, "InvalidAddress");
    });

    it("should allow new owner to update manifest", async function () {
      await registry.connect(alice).transferProjectOwnership("myproject", bob.address);
      await registry.connect(bob).updateManifest("myproject", '{"new":"owner"}');

      const project = await registry.getProject("myproject");
      expect(project.manifest).to.equal('{"new":"owner"}');
    });
  });

  describe("Queries", function () {
    it("should check name availability", async function () {
      expect(await registry.isNameAvailable("free")).to.be.true;
      await registry.registerProject("free", "{}");
      expect(await registry.isNameAvailable("free")).to.be.false;
    });

    it("should list projects by founder", async function () {
      await registry.connect(alice).registerProject("proj1", "{}");
      await registry.connect(alice).registerProject("proj2", "{}");

      const projects = await registry.getProjectsByFounder(alice.address);
      expect(projects.length).to.equal(2);
    });
  });
});
