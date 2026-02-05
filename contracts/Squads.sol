// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Squads
 * @notice Manages specialized squads (e.g., Legal, Dev) and their tasks
 */
contract Squads is Ownable, ReentrancyGuard {
    // Squad types for the Genesis Transition model
    enum SquadType {
        General,
        Admissions, // Decide who gets in
        Services, // Do the work (agents, contractors)
        Treasury // Hold and manage funds
    }

    struct Task {
        string description;
        uint256 reward;
        address assignee;
        bool completed;
        bool approved;
        address creator;
    }

    struct Squad {
        string name;
        SquadType squadType;
        address[] members;
        mapping(address => bool) isMember;
        uint256 budget;
        // Tasks
        mapping(uint256 => Task) tasks;
        uint256 taskCount;
    }

    // Squad ID => Squad
    mapping(uint256 => Squad) public squads;
    uint256 public squadCount;

    // HubDAO address (for budget requests - future integration)
    address public hubDao;

    event SquadCreated(
        uint256 indexed squadId,
        string name,
        SquadType squadType
    );
    event MemberAdded(uint256 indexed squadId, address member);
    event MemberRemoved(uint256 indexed squadId, address member);
    event TaskCreated(
        uint256 indexed squadId,
        uint256 indexed taskId,
        string description,
        uint256 reward
    );
    event TaskAssigned(
        uint256 indexed squadId,
        uint256 indexed taskId,
        address assignee
    );
    event TaskCompleted(uint256 indexed squadId, uint256 indexed taskId);
    event BudgetAllocated(uint256 indexed squadId, uint256 amount);

    constructor(address _initialOwner) Ownable(_initialOwner) {}

    modifier onlyHubOrOwner() {
        require(
            msg.sender == owner() || msg.sender == hubDao,
            "Not authorized"
        );
        _;
    }

    function setHubDao(address _hubDao) external onlyOwner {
        hubDao = _hubDao;
    }

    /**
     * @notice Add funds to a squad's budget
     */
    function fundSquadBudget(
        uint256 squadId,
        uint256 amount
    ) external onlyHubOrOwner nonReentrant {
        require(squadId > 0 && squadId <= squadCount, "Invalid squad ID");
        squads[squadId].budget += amount;
        emit BudgetAllocated(squadId, amount);
    }

    modifier onlySquadMember(uint256 squadId) {
        require(squads[squadId].isMember[msg.sender], "Not a squad member");
        _;
    }

    /**
     * @notice Create a new squad
     * @param name Name of the squad (e.g. "Legal")
     * @param squadType Type of squad (Admissions, Services, Treasury, or General)
     */
    function createSquad(
        string calldata name,
        SquadType squadType
    ) external onlyOwner {
        squadCount++;
        Squad storage newSquad = squads[squadCount];
        newSquad.name = name;
        newSquad.squadType = squadType;

        emit SquadCreated(squadCount, name, squadType);
    }

    /**
     * @notice Add a member to a squad
     * @param squadId ID of the squad
     * @param member Address to add
     */
    function addMember(uint256 squadId, address member) external onlyOwner {
        require(squadId > 0 && squadId <= squadCount, "Invalid squad ID");
        require(!squads[squadId].isMember[member], "Already a member");

        squads[squadId].isMember[member] = true;
        squads[squadId].members.push(member);

        emit MemberAdded(squadId, member);
    }

    /**
     * @notice Remove a member from a squad
     * @param squadId ID of the squad
     * @param member Address to remove
     */
    function removeMember(uint256 squadId, address member) external onlyOwner {
        require(squadId > 0 && squadId <= squadCount, "Invalid squad ID");
        require(squads[squadId].isMember[member], "Not a member");

        squads[squadId].isMember[member] = false;

        // Remove from members array
        address[] storage members = squads[squadId].members;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == member) {
                members[i] = members[members.length - 1];
                members.pop();
                break;
            }
        }

        emit MemberRemoved(squadId, member);
    }

    /**
     * @notice Create a task within a squad
     * @param squadId ID of the squad
     * @param description Task description
     * @param reward Reward amount (in treasury token units)
     */
    function createTask(
        uint256 squadId,
        string calldata description,
        uint256 reward
    ) external onlySquadMember(squadId) {
        Squad storage squad = squads[squadId];

        squad.taskCount++;
        Task storage newTask = squad.tasks[squad.taskCount];
        newTask.description = description;
        newTask.reward = reward;
        newTask.creator = msg.sender;

        emit TaskCreated(squadId, squad.taskCount, description, reward);
    }

    /**
     * @notice Assign a task to a member
     * @param squadId ID of the squad
     * @param taskId ID of the task
     * @param assignee Address to assign
     */
    function assignTask(
        uint256 squadId,
        uint256 taskId,
        address assignee
    ) external onlySquadMember(squadId) {
        Squad storage squad = squads[squadId];
        require(squad.isMember[assignee], "Assignee not in squad");
        require(taskId > 0 && taskId <= squad.taskCount, "Invalid task ID");

        squad.tasks[taskId].assignee = assignee;

        emit TaskAssigned(squadId, taskId, assignee);
    }

    /**
     * @notice Mark task as completed (by assignee)
     * @param squadId ID of the squad
     * @param taskId ID of the task
     */
    function completeTask(uint256 squadId, uint256 taskId) external {
        // Any member or just assignee? Let's say assignee.
        Squad storage squad = squads[squadId];
        Task storage task = squad.tasks[taskId];

        require(task.assignee == msg.sender, "Not assignee");
        require(!task.completed, "Already completed");

        task.completed = true;

        emit TaskCompleted(squadId, taskId);
    }

    // Future: Approval mechanism where another member verifies works and triggers payment via HubDAO

    /**
     * @notice Get squad details (helper)
     */
    function getSquadName(
        uint256 squadId
    ) external view returns (string memory) {
        return squads[squadId].name;
    }
}
