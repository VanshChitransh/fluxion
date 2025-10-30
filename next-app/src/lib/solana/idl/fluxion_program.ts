/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/fluxion_program.json`.
 */
export type FluxionProgram = {
  "address": "2nGrkskjUEF5pkDgvrdSMsz9f59GX6a6M8rwZAahdTFL",
  "metadata": {
    "name": "fluxionProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "claimNftReward",
      "docs": [
        "Claim NFT reward (records the claim on-chain)"
      ],
      "discriminator": [
        120,
        5,
        199,
        83,
        114,
        16,
        76,
        3
      ],
      "accounts": [
        {
          "name": "nftClaim",
          "writable": true,
          "signer": true
        },
        {
          "name": "userProfile",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "rewardType",
          "type": {
            "defined": {
              "name": "rewardType"
            }
          }
        },
        {
          "name": "metadataUri",
          "type": "string"
        }
      ]
    },
    {
      "name": "initializeUser",
      "docs": [
        "Initialize a new user profile"
      ],
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        }
      ]
    },
    {
      "name": "recordGameResult",
      "docs": [
        "Record a game result on-chain"
      ],
      "discriminator": [
        76,
        178,
        240,
        50,
        154,
        129,
        198,
        67
      ],
      "accounts": [
        {
          "name": "gameResult",
          "writable": true,
          "signer": true
        },
        {
          "name": "userProfile",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gameType",
          "type": {
            "defined": {
              "name": "gameType"
            }
          }
        },
        {
          "name": "result",
          "type": {
            "defined": {
              "name": "gameResultData"
            }
          }
        }
      ]
    },
    {
      "name": "updateElo",
      "docs": [
        "Update user ELO after a game"
      ],
      "discriminator": [
        68,
        19,
        100,
        169,
        152,
        2,
        204,
        112
      ],
      "accounts": [
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "user",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "eloChange",
          "type": "i16"
        },
        {
          "name": "gameWon",
          "type": "bool"
        },
        {
          "name": "gameType",
          "type": {
            "defined": {
              "name": "gameType"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameResult",
      "discriminator": [
        154,
        160,
        133,
        130,
        0,
        179,
        92,
        10
      ]
    },
    {
      "name": "nftClaim",
      "discriminator": [
        1,
        216,
        111,
        198,
        212,
        242,
        101,
        243
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "usernameTooLong",
      "msg": "Username must be 32 characters or less"
    },
    {
      "code": 6001,
      "name": "usernameEmpty",
      "msg": "Username cannot be empty"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "Unauthorized: You don't own this profile"
    },
    {
      "code": 6003,
      "name": "uriTooLong",
      "msg": "Metadata URI too long (max 200 characters)"
    }
  ],
  "types": [
    {
      "name": "gameResult",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "gameType",
            "type": {
              "defined": {
                "name": "gameType"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "won",
            "type": "bool"
          },
          {
            "name": "eloChange",
            "type": "i16"
          },
          {
            "name": "finalElo",
            "type": "u16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "pnl",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "gameResultData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "won",
            "type": "bool"
          },
          {
            "name": "eloChange",
            "type": "i16"
          },
          {
            "name": "symbol",
            "type": "string"
          },
          {
            "name": "pnl",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "gameType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "predictBattle"
          },
          {
            "name": "battleRoyale"
          }
        ]
      }
    },
    {
      "name": "nftClaim",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "rewardType",
            "type": {
              "defined": {
                "name": "rewardType"
              }
            }
          },
          {
            "name": "metadataUri",
            "type": "string"
          },
          {
            "name": "claimedAt",
            "type": "i64"
          },
          {
            "name": "eloAtClaim",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "rewardType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "dailyLogin"
          },
          {
            "name": "tierAchievement"
          },
          {
            "name": "winStreak"
          },
          {
            "name": "tournament"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": "string"
          },
          {
            "name": "elo",
            "type": "u16"
          },
          {
            "name": "totalGames",
            "type": "u32"
          },
          {
            "name": "wins",
            "type": "u32"
          },
          {
            "name": "losses",
            "type": "u32"
          },
          {
            "name": "predictGames",
            "type": "u32"
          },
          {
            "name": "battleGames",
            "type": "u32"
          },
          {
            "name": "highestElo",
            "type": "u16"
          },
          {
            "name": "totalEarnings",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "lastPlayed",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
