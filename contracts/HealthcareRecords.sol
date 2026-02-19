// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HealthcareRecords {
    mapping(address => bytes32[]) private patientRecords;
    mapping(address => mapping(address => bool)) private patientDoctorAccess;

    event RecordAdded(address indexed patient, bytes32 indexed recordHash, uint256 index);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    function addRecordHash(bytes32 recordHash) external {
        require(recordHash != bytes32(0), "Invalid record hash");

        patientRecords[msg.sender].push(recordHash);
        emit RecordAdded(msg.sender, recordHash, patientRecords[msg.sender].length - 1);
    }

    function grantAccess(address doctor) external {
        require(doctor != address(0), "Invalid doctor address");
        require(doctor != msg.sender, "Cannot grant to self");

        patientDoctorAccess[msg.sender][doctor] = true;
        emit AccessGranted(msg.sender, doctor);
    }

    function revokeAccess(address doctor) external {
        require(doctor != address(0), "Invalid doctor address");

        patientDoctorAccess[msg.sender][doctor] = false;
        emit AccessRevoked(msg.sender, doctor);
    }

    function hasAccess(address patient, address doctor) public view returns (bool) {
        return patientDoctorAccess[patient][doctor];
    }

    function getRecords(address patient) external view returns (bytes32[] memory) {
        require(patient != address(0), "Invalid patient address");
        require(msg.sender == patient || patientDoctorAccess[patient][msg.sender], "Access denied");

        return patientRecords[patient];
    }
}
