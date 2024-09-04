{
  "manifestVersion": "3.2",
  "admin": {
    "address": "0x54BA135FcD35261C06d840424b68B6a885b3b2c9",
    "txHash": "0x4d8054bc32472eae36b2c6c571ade895909c7e847eb525877353618d73e60d5f"
  },
  "proxies": [
    {
      "address": "0x9e8bbc02040f09033fa54453FA8726D0FF2B7Be4",
      "txHash": "0xcda96594318c658088467a5fadc6594078b6677833c9dbbf71e3aa196f2e7d8b",
      "kind": "transparent"
    },
    {
      "address": "0xb3FC2eE8CA47908631599816683698F786acD7dA",
      "txHash": "0xeee1e14970c6b1abc5b7879c33444024108ea1628caa50ea8a417b2aed303b7e",
      "kind": "transparent"
    },
    {
      "address": "0x54AaDda9aA2ae4BFd3C15A6e51B78cD7dB3A818b",
      "txHash": "0xdd3d7f8a3444fab8e33bf323462f0259104d09454c119bc683bfb175ccec1ce6",
      "kind": "transparent"
    },
    {
      "address": "0x3C766eD35203eC76371da7419946D4204A53a91E",
      "txHash": "0xb7eaa21588b90870b7d17309b172e1dc12a1a9dc6c0db1a64bfeadf4cb78462e",
      "kind": "transparent"
    }
  ],
  "impls": {
    "060d4198a34d76f2dd50d2c59810d0b599f58395a3915d77a6a8fae6ce72dd6f": {
      "address": "0x4EbdFa4AE93c4aC32A77E4f21e685ad69acDA9cF",
      "txHash": "0x2011f13a6ffa5db03125d1a72791ae70902af70e99715b55d46b1df5effd1719",
      "layout": {
        "storage": [
          {
            "contract": "Initializable",
            "label": "_initialized",
            "type": "t_bool",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol:39"
          },
          {
            "contract": "Initializable",
            "label": "_initializing",
            "type": "t_bool",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol:44"
          },
          {
            "contract": "ContextUpgradeable",
            "label": "__gap",
            "type": "t_array(t_uint256)50_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol:31"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_balances",
            "type": "t_mapping(t_address,t_uint256)",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:35"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_totalSupply",
            "type": "t_uint256",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:37"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_name",
            "type": "t_string_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:39"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_symbol",
            "type": "t_string_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:40"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_defaultOperatorsArray",
            "type": "t_array(t_address)dyn_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:46"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_defaultOperators",
            "type": "t_mapping(t_address,t_bool)",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:49"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_operators",
            "type": "t_mapping(t_address,t_mapping(t_address,t_bool))",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:52"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_revokedDefaultOperators",
            "type": "t_mapping(t_address,t_mapping(t_address,t_bool))",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:53"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_allowances",
            "type": "t_mapping(t_address,t_mapping(t_address,t_uint256))",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:56"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "__gap",
            "type": "t_array(t_uint256)41_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:549"
          },
          {
            "contract": "Pool0",
            "label": "servicer",
            "type": "t_address",
            "src": "project:/contracts/PoolCore/Pool0.sol:24"
          },
          {
            "contract": "Pool0",
            "label": "ERCAddress",
            "type": "t_address",
            "src": "project:/contracts/PoolCore/Pool0.sol:25"
          },
          {
            "contract": "Pool0",
            "label": "servicerAddresses",
            "type": "t_array(t_address)dyn_storage",
            "src": "project:/contracts/PoolCore/Pool0.sol:26"
          },
          {
            "contract": "Pool0",
            "label": "poolLent",
            "type": "t_uint256",
            "src": "project:/contracts/PoolCore/Pool0.sol:29"
          },
          {
            "contract": "Pool0",
            "label": "poolBorrowed",
            "type": "t_uint256",
            "src": "project:/contracts/PoolCore/Pool0.sol:30"
          },
          {
            "contract": "Pool0",
            "label": "userLoans",
            "type": "t_mapping(t_address,t_array(t_uint256)dyn_storage)",
            "src": "project:/contracts/PoolCore/Pool0.sol:31"
          },
          {
            "contract": "Pool0",
            "label": "loans",
            "type": "t_array(t_struct(Loan)14373_storage)dyn_storage",
            "src": "project:/contracts/PoolCore/Pool0.sol:32"
          },
          {
            "contract": "Pool0",
            "label": "loanCount",
            "type": "t_uint256",
            "src": "project:/contracts/PoolCore/Pool0.sol:33"
          }
        ],
        "types": {
          "t_address": {
            "label": "address"
          },
          "t_array(t_address)dyn_storage": {
            "label": "address[]"
          },
          "t_uint256": {
            "label": "uint256"
          },
          "t_mapping(t_address,t_array(t_uint256)dyn_storage)": {
            "label": "mapping(address => uint256[])"
          },
          "t_array(t_uint256)dyn_storage": {
            "label": "uint256[]"
          },
          "t_array(t_struct(Loan)14373_storage)dyn_storage": {
            "label": "struct Pool0.Loan[]"
          },
          "t_struct(Loan)14373_storage": {
            "label": "struct Pool0.Loan",
            "members": [
              {
                "label": "loanId",
                "type": "t_uint256"
              },
              {
                "label": "borrower",
                "type": "t_address"
              },
              {
                "label": "interestRate",
                "type": "t_uint256"
              },
              {
                "label": "principal",
                "type": "t_uint256"
              },
              {
                "label": "interestAccrued",
                "type": "t_uint256"
              },
              {
                "label": "timeLastPayment",
                "type": "t_uint256"
              }
            ]
          },
          "t_mapping(t_address,t_uint256)": {
            "label": "mapping(address => uint256)"
          },
          "t_string_storage": {
            "label": "string"
          },
          "t_mapping(t_address,t_bool)": {
            "label": "mapping(address => bool)"
          },
          "t_bool": {
            "label": "bool"
          },
          "t_mapping(t_address,t_mapping(t_address,t_bool))": {
            "label": "mapping(address => mapping(address => bool))"
          },
          "t_mapping(t_address,t_mapping(t_address,t_uint256))": {
            "label": "mapping(address => mapping(address => uint256))"
          },
          "t_array(t_uint256)41_storage": {
            "label": "uint256[41]"
          },
          "t_array(t_uint256)50_storage": {
            "label": "uint256[50]"
          }
        }
      }
    },
    "8d770557c02d2a9801bf573b46d82b0c80daa1eff6d0be74561be88d586ad957": {
      "address": "0x9e8bbc02040f09033fa54453FA8726D0FF2B7Be4",
      "txHash": "0xe42ea19760e36c9796c9e34f3e1ef0d5e600e3a9f06ad1ecc0101f6b8e970e16",
      "layout": {
        "storage": [
          {
            "contract": "Initializable",
            "label": "_initialized",
            "type": "t_bool",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol:39"
          },
          {
            "contract": "Initializable",
            "label": "_initializing",
            "type": "t_bool",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol:44"
          },
          {
            "contract": "ContextUpgradeable",
            "label": "__gap",
            "type": "t_array(t_uint256)50_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol:31"
          },
          {
            "contract": "ERC165Upgradeable",
            "label": "__gap",
            "type": "t_array(t_uint256)50_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol:36"
          },
          {
            "contract": "ERC721Upgradeable",
            "label": "_name",
            "type": "t_string_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol:25"
          },
          {
            "contract": "ERC721Upgradeable",
            "label": "_symbol",
            "type": "t_string_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol:28"
          },
          {
            "contract": "ERC721Upgradeable",
            "label": "_owners",
            "type": "t_mapping(t_uint256,t_address)",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol:31"
          },
          {
            "contract": "ERC721Upgradeable",
            "label": "_balances",
            "type": "t_mapping(t_address,t_uint256)",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol:34"
          },
          {
            "contract": "ERC721Upgradeable",
            "label": "_tokenApprovals",
            "type": "t_mapping(t_uint256,t_address)",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol:37"
          },
          {
            "contract": "ERC721Upgradeable",
            "label": "_operatorApprovals",
            "type": "t_mapping(t_address,t_mapping(t_address,t_bool))",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol:40"
          },
          {
            "contract": "ERC721Upgradeable",
            "label": "__gap",
            "type": "t_array(t_uint256)44_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol:431"
          },
          {
            "contract": "ERC721URIStorageUpgradeable",
            "label": "_tokenURIs",
            "type": "t_mapping(t_uint256,t_string_storage)",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol:24"
          },
          {
            "contract": "ERC721URIStorageUpgradeable",
            "label": "__gap",
            "type": "t_array(t_uint256)49_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol:76"
          },
          {
            "contract": "PropToken0",
            "label": "lienCount",
            "type": "t_uint256",
            "src": "project:/contracts/PropTokens/PropToken0.sol:23"
          },
          {
            "contract": "PropToken0",
            "label": "servicerAddresses",
            "type": "t_array(t_address)dyn_storage",
            "src": "project:/contracts/PropTokens/PropToken0.sol:24"
          },
          {
            "contract": "PropToken0",
            "label": "poolAddresses",
            "type": "t_array(t_address)dyn_storage",
            "src": "project:/contracts/PropTokens/PropToken0.sol:25"
          },
          {
            "contract": "PropToken0",
            "label": "lienData",
            "type": "t_mapping(t_uint256,t_struct(Lien)35267_storage)",
            "src": "project:/contracts/PropTokens/PropToken0.sol:26"
          }
        ],
        "types": {
          "t_uint256": {
            "label": "uint256"
          },
          "t_array(t_address)dyn_storage": {
            "label": "address[]"
          },
          "t_address": {
            "label": "address"
          },
          "t_mapping(t_uint256,t_struct(Lien)35267_storage)": {
            "label": "mapping(uint256 => struct PropToken0.Lien)"
          },
          "t_struct(Lien)35267_storage": {
            "label": "struct PropToken0.Lien",
            "members": [
              {
                "label": "lienIndex",
                "type": "t_uint256"
              },
              {
                "label": "lienValue",
                "type": "t_uint256"
              },
              {
                "label": "seniorLienValues",
                "type": "t_array(t_uint256)dyn_storage"
              },
              {
                "label": "propValue",
                "type": "t_uint256"
              },
              {
                "label": "propAddress",
                "type": "t_string_storage"
              },
              {
                "label": "issuedAtTimestamp",
                "type": "t_uint256"
              }
            ]
          },
          "t_array(t_uint256)dyn_storage": {
            "label": "uint256[]"
          },
          "t_string_storage": {
            "label": "string"
          },
          "t_mapping(t_uint256,t_string_storage)": {
            "label": "mapping(uint256 => string)"
          },
          "t_array(t_uint256)49_storage": {
            "label": "uint256[49]"
          },
          "t_mapping(t_uint256,t_address)": {
            "label": "mapping(uint256 => address)"
          },
          "t_mapping(t_address,t_uint256)": {
            "label": "mapping(address => uint256)"
          },
          "t_mapping(t_address,t_mapping(t_address,t_bool))": {
            "label": "mapping(address => mapping(address => bool))"
          },
          "t_mapping(t_address,t_bool)": {
            "label": "mapping(address => bool)"
          },
          "t_bool": {
            "label": "bool"
          },
          "t_array(t_uint256)44_storage": {
            "label": "uint256[44]"
          },
          "t_array(t_uint256)50_storage": {
            "label": "uint256[50]"
          }
        }
      }
    },
    "033e061251b35c6f6253558ca82cd737b0271f48e42313aac914fad27ddb19ca": {
      "address": "0x3206f1Daa7108E26eE9B92a4B04D760d2A1552C5",
      "txHash": "0xcb47d7a24d2ef1e51114bcaa08830b79039bfc926dfaa0d6aa491b3043bfd1cb",
      "layout": {
        "storage": [
          {
            "contract": "Initializable",
            "label": "_initialized",
            "type": "t_bool",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol:39"
          },
          {
            "contract": "Initializable",
            "label": "_initializing",
            "type": "t_bool",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol:44"
          },
          {
            "contract": "ContextUpgradeable",
            "label": "__gap",
            "type": "t_array(t_uint256)50_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol:31"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_balances",
            "type": "t_mapping(t_address,t_uint256)",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:35"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_totalSupply",
            "type": "t_uint256",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:37"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_name",
            "type": "t_string_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:39"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_symbol",
            "type": "t_string_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:40"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_defaultOperatorsArray",
            "type": "t_array(t_address)dyn_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:46"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_defaultOperators",
            "type": "t_mapping(t_address,t_bool)",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:49"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_operators",
            "type": "t_mapping(t_address,t_mapping(t_address,t_bool))",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:52"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_revokedDefaultOperators",
            "type": "t_mapping(t_address,t_mapping(t_address,t_bool))",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:53"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "_allowances",
            "type": "t_mapping(t_address,t_mapping(t_address,t_uint256))",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:56"
          },
          {
            "contract": "ERC777Upgradeable",
            "label": "__gap",
            "type": "t_array(t_uint256)41_storage",
            "src": "project:/contracts/@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol:549"
          },
          {
            "contract": "Pool1",
            "label": "servicer",
            "type": "t_address",
            "src": "project:/contracts/PoolCore/Pool1.sol:26"
          },
          {
            "contract": "Pool1",
            "label": "ERCAddress",
            "type": "t_address",
            "src": "project:/contracts/PoolCore/Pool1.sol:27"
          },
          {
            "contract": "Pool1",
            "label": "servicerAddresses",
            "type": "t_array(t_address)dyn_storage",
            "src": "project:/contracts/PoolCore/Pool1.sol:28"
          },
          {
            "contract": "Pool1",
            "label": "poolLent",
            "type": "t_uint256",
            "src": "project:/contracts/PoolCore/Pool1.sol:31"
          },
          {
            "contract": "Pool1",
            "label": "poolBorrowed",
            "type": "t_uint256",
            "src": "project:/contracts/PoolCore/Pool1.sol:32"
          },
          {
            "contract": "Pool1",
            "label": "userLoans",
            "type": "t_mapping(t_address,t_array(t_uint256)dyn_storage)",
            "src": "project:/contracts/PoolCore/Pool1.sol:33"
          },
          {
            "contract": "Pool1",
            "label": "loans",
            "type": "t_array(t_struct(Loan)15409_storage)dyn_storage",
            "src": "project:/contracts/PoolCore/Pool1.sol:34"
          },
          {
            "contract": "Pool1",
            "label": "loanCount",
            "type": "t_uint256",
            "src": "project:/contracts/PoolCore/Pool1.sol:35"
          },
          {
            "contract": "Pool1",
            "label": "_name",
            "type": "t_string_storage",
            "src": "project:/contracts/PoolCore/Pool1.sol:43"
          },
          {
            "contract": "Pool1",
            "label": "_symbol",
            "type": "t_string_storage",
            "src": "project:/contracts/PoolCore/Pool1.sol:44"
          },
          {
            "contract": "Pool1",
            "label": "loanToPropToken",
            "type": "t_mapping(t_uint256,t_uint256)",
            "src": "project:/contracts/PoolCore/Pool1.sol:45"
          },
          {
            "contract": "Pool1",
            "label": "propTokenContractAddress",
            "type": "t_address",
            "src": "project:/contracts/PoolCore/Pool1.sol:46"
          }
        ],
        "types": {
          "t_address": {
            "label": "address"
          },
          "t_array(t_address)dyn_storage": {
            "label": "address[]"
          },
          "t_uint256": {
            "label": "uint256"
          },
          "t_mapping(t_address,t_array(t_uint256)dyn_storage)": {
            "label": "mapping(address => uint256[])"
          },
          "t_array(t_uint256)dyn_storage": {
            "label": "uint256[]"
          },
          "t_array(t_struct(Loan)15409_storage)dyn_storage": {
            "label": "struct Pool1.Loan[]"
          },
          "t_struct(Loan)15409_storage": {
            "label": "struct Pool1.Loan",
            "members": [
              {
                "label": "loanId",
                "type": "t_uint256"
              },
              {
                "label": "borrower",
                "type": "t_address"
              },
              {
                "label": "interestRate",
                "type": "t_uint256"
              },
              {
                "label": "principal",
                "type": "t_uint256"
              },
              {
                "label": "interestAccrued",
                "type": "t_uint256"
              },
              {
                "label": "timeLastPayment",
                "type": "t_uint256"
              }
            ]
          },
          "t_string_storage": {
            "label": "string"
          },
          "t_mapping(t_uint256,t_uint256)": {
            "label": "mapping(uint256 => uint256)"
          },
          "t_mapping(t_address,t_uint256)": {
            "label": "mapping(address => uint256)"
          },
          "t_mapping(t_address,t_bool)": {
            "label": "mapping(address => bool)"
          },
          "t_bool": {
            "label": "bool"
          },
          "t_mapping(t_address,t_mapping(t_address,t_bool))": {
            "label": "mapping(address => mapping(address => bool))"
          },
          "t_mapping(t_address,t_mapping(t_address,t_uint256))": {
            "label": "mapping(address => mapping(address => uint256))"
          },
          "t_array(t_uint256)41_storage": {
            "label": "uint256[41]"
          },
          "t_array(t_uint256)50_storage": {
            "label": "uint256[50]"
          }
        }
      }
    }
  }
}
