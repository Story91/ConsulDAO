// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ProjectRegistry
 * @notice Simple on-chain registry for ConsulDAO incubated projects
 * @dev Stores project manifests similar to ENS text records, but optimized for L2
 * 
 * Prize Target: ENS - "Creative DeFi Use of ENS"
 * We demonstrate ENS-like functionality with on-chain identity storage
 */
contract ProjectRegistry {
    
    struct Project {
        string name;
        string manifest;      // JSON manifest (like ENS text record)
        address founder;
        uint256 registeredAt;
        bool exists;
    }

    // Project name => Project data
    mapping(string => Project) public projects;
    
    // Founder address => list of project names
    mapping(address => string[]) public founderProjects;
    
    // Total projects registered
    uint256 public totalProjects;

    // Events
    event ProjectRegistered(
        string indexed nameHash,
        string name,
        address indexed founder,
        string manifest,
        uint256 timestamp
    );
    
    event ProjectUpdated(
        string indexed nameHash,
        string name,
        string manifest,
        uint256 timestamp
    );

    event ProjectTransferred(
        string indexed nameHash,
        string name,
        address indexed oldFounder,
        address indexed newFounder
    );

    // Errors
    error ProjectAlreadyExists(string name);
    error ProjectNotFound(string name);
    error NotProjectOwner(string name, address caller);
    error InvalidName();
    error InvalidAddress();

    /**
     * @notice Register a new project
     * @param name Project name (will be the subdomain-like identifier)
     * @param manifest JSON string containing project metadata
     */
    function registerProject(string calldata name, string calldata manifest) external {
        if (bytes(name).length == 0 || bytes(name).length > 32) {
            revert InvalidName();
        }
        
        if (projects[name].exists) {
            revert ProjectAlreadyExists(name);
        }

        projects[name] = Project({
            name: name,
            manifest: manifest,
            founder: msg.sender,
            registeredAt: block.timestamp,
            exists: true
        });

        founderProjects[msg.sender].push(name);
        totalProjects++;

        emit ProjectRegistered(name, name, msg.sender, manifest, block.timestamp);
    }

    /**
     * @notice Update project manifest (only founder can update)
     * @param name Project name
     * @param manifest New manifest JSON
     */
    function updateManifest(string calldata name, string calldata manifest) external {
        if (!projects[name].exists) {
            revert ProjectNotFound(name);
        }
        
        if (projects[name].founder != msg.sender) {
            revert NotProjectOwner(name, msg.sender);
        }

        projects[name].manifest = manifest;

        emit ProjectUpdated(name, name, manifest, block.timestamp);
    }

    /**
     * @notice Transfer project ownership to a new founder
     * @param name Project name
     * @param newFounder New owner address
     */
    function transferProjectOwnership(string calldata name, address newFounder) external {
        if (!projects[name].exists) {
            revert ProjectNotFound(name);
        }
        if (projects[name].founder != msg.sender) {
            revert NotProjectOwner(name, msg.sender);
        }
        if (newFounder == address(0)) {
            revert InvalidAddress();
        }

        address oldFounder = projects[name].founder;
        projects[name].founder = newFounder;

        // Add to new founder's project list
        founderProjects[newFounder].push(name);

        // Remove from old founder's project list
        string[] storage oldProjects = founderProjects[oldFounder];
        for (uint256 i = 0; i < oldProjects.length; i++) {
            if (keccak256(bytes(oldProjects[i])) == keccak256(bytes(name))) {
                oldProjects[i] = oldProjects[oldProjects.length - 1];
                oldProjects.pop();
                break;
            }
        }

        emit ProjectTransferred(name, name, oldFounder, newFounder);
    }

    /**
     * @notice Get project details
     * @param name Project name
     */
    function getProject(string calldata name) external view returns (
        string memory projectName,
        string memory manifest,
        address founder,
        uint256 registeredAt,
        bool exists
    ) {
        Project memory p = projects[name];
        return (p.name, p.manifest, p.founder, p.registeredAt, p.exists);
    }

    /**
     * @notice Get all projects by founder
     * @param founder Founder address
     */
    function getProjectsByFounder(address founder) external view returns (string[] memory) {
        return founderProjects[founder];
    }

    /**
     * @notice Check if project name is available
     * @param name Project name to check
     */
    function isNameAvailable(string calldata name) external view returns (bool) {
        return !projects[name].exists;
    }
}

