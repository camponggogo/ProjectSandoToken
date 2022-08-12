// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

contract SANDOStakeV1 is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeMathUpgradeable for uint256;
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct StakePool {
        uint256 _stakeDate;
        uint256 _stakeReward;
        bool _isExist;
    }

    struct StakeLock {
        uint256 expiration;
        bool status;
        uint256 amount;
    }

    mapping(uint256 => StakePool) public stakePoolList;
    mapping(address => mapping(uint256 => StakeLock)) public userStakeLock;
    mapping(address => uint256[]) public userTokenStakeId;

    function initialize(address _token) public initializer {
        __AccessControl_init();
        __ReentrancyGuard_init();
        __Pausable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    function getStakePool(uint256 _date)
        public
        view
        returns (StakePool memory)
    {
        return stakePoolList[_date];
    }

    function stake(uint256 _amount, uint256 _pool)
        external
        nonReentrant
        whenNotPaused
    {
        require(_amount > 0, "Amount: non zero");
        require(_pool > 0, "Pool: not empty");

        StakePool memory _stakePool = getStakePool(_pool);
        require(_stakePool._isExist == true, "Pool: not exist");

        uint256 _unstakeDate = uint256(block.timestamp).add(
            _stakePool._stakeDate
        );

        uint256 _stakeId = getStakeListsByOwner(msg.sender).length;

        userStakeLock[msg.sender][_stakeId] = StakeLock(
            _unstakeDate,
            false,
            _amount
        );
        userTokenStakeId[msg.sender].push(_stakeId);
    }

    function getStakeListsByOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        return userTokenStakeId[_owner];
    }
}
