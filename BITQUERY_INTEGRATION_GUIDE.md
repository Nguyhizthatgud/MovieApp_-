# BitQuery Integration Guide

## 🔗 **What is BitQuery?**

BitQuery is a comprehensive blockchain data platform that provides:

- 📊 **GraphQL APIs** for querying blockchain data
- 🔍 **Real-time & Historical Data** from 40+ blockchains
- 💰 **DeFi Analytics** - DEX trades, liquidity, yields
- 🎨 **NFT Data** - collections, trades, marketplace analytics
- 📈 **Token Analytics** - transfers, holders, price data
- 🌐 **Multi-chain Support** - Ethereum, BSC, Polygon, Solana, etc.

## 🏗️ **BitQuery API Architecture**

### **Core Components**

```
BitQuery Platform
├── GraphQL API Endpoints
├── Streaming APIs (WebSocket)
├── REST APIs (Limited)
├── Cloud IDE for queries
└── Data Export capabilities
```

### **Data Categories**

1. **DEX Trading Data**
2. **Token Transfers & Balances**
3. **NFT Collections & Trades**
4. **Smart Contract Events**
5. **Address Analytics**
6. **DeFi Protocol Data**

## 🛠️ **Integration Approaches**

### **1. Direct API Integration**

```javascript
// src/shared/services/bitquery/client.js
import axios from "axios";

class BitQueryClient {
  constructor() {
    this.baseURL = "https://graphql.bitquery.io";
    this.apiKey = process.env.VITE_BITQUERY_API_KEY;

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this.apiKey
      }
    });
  }

  async query(graphqlQuery, variables = {}) {
    try {
      const response = await this.client.post("/", {
        query: graphqlQuery,
        variables
      });

      if (response.data.errors) {
        throw new Error(`BitQuery Error: ${response.data.errors[0].message}`);
      }

      return response.data.data;
    } catch (error) {
      console.error("BitQuery API Error:", error);
      throw error;
    }
  }

  // Get DEX trades for a token
  async getTokenTrades(tokenAddress, network = "ethereum", limit = 100) {
    const query = `
      query GetTokenTrades($tokenAddress: String!, $network: EthereumNetwork!, $limit: Int!) {
        ethereum(network: $network) {
          dexTrades(
            options: {limit: $limit, desc: "block.timestamp.time"}
            baseCurrency: {is: $tokenAddress}
          ) {
            block {
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
              }
              height
            }
            transaction {
              hash
            }
            smartContract {
              address {
                address
              }
            }
            tradeAmount(in: USD)
            buyAmount
            buyAmountInUsd: buyAmount(in: USD)
            buyCurrency {
              address
              symbol
              name
            }
            sellAmount
            sellAmountInUsd: sellAmount(in: USD)
            sellCurrency {
              address
              symbol
              name
            }
            exchange {
              name
            }
          }
        }
      }
    `;

    return this.query(query, {
      tokenAddress,
      network,
      limit
    });
  }

  // Get NFT collection data
  async getNFTCollection(contractAddress, network = "ethereum", limit = 50) {
    const query = `
      query GetNFTCollection($contractAddress: String!, $network: EthereumNetwork!, $limit: Int!) {
        ethereum(network: $network) {
          transfers(
            options: {limit: $limit, desc: "block.timestamp.time"}
            currency: {is: $contractAddress}
            amount: {gt: 0}
          ) {
            block {
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
              }
              height
            }
            transaction {
              hash
            }
            sender {
              address
            }
            receiver {
              address
            }
            currency {
              address
              symbol
              name
              tokenType
            }
            amount
            amountInUSD: amount(in: USD)
          }
        }
      }
    `;

    return this.query(query, {
      contractAddress,
      network,
      limit
    });
  }

  // Get wallet portfolio
  async getWalletPortfolio(walletAddress, network = "ethereum") {
    const query = `
      query GetWalletPortfolio($walletAddress: String!, $network: EthereumNetwork!) {
        ethereum(network: $network) {
          address(address: {is: $walletAddress}) {
            balances {
              currency {
                address
                symbol
                name
                decimals
              }
              value
              valueInUSD: value(in: USD)
            }
          }
        }
      }
    `;

    return this.query(query, {
      walletAddress,
      network
    });
  }

  // Get DeFi protocol data
  async getDeFiData(protocol, network = "ethereum", limit = 100) {
    const query = `
      query GetDeFiData($protocol: String!, $network: EthereumNetwork!, $limit: Int!) {
        ethereum(network: $network) {
          smartContractCalls(
            options: {limit: $limit, desc: "block.timestamp.time"}
            smartContractAddress: {is: $protocol}
          ) {
            block {
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
              }
            }
            transaction {
              hash
              gasValue
              gasPrice
            }
            smartContract {
              contractType
              currency {
                symbol
                name
              }
            }
            smartContractMethod {
              name
              signatureHash
            }
            caller {
              address
            }
          }
        }
      }
    `;

    return this.query(query, {
      protocol,
      network,
      limit
    });
  }
}

export const bitQueryClient = new BitQueryClient();
export default bitQueryClient;
```

### **2. Feature-Specific Services**

```javascript
// src/features/crypto/services/cryptoAnalytics.js
import { bitQueryClient } from "@/shared/services/bitquery/client";

class CryptoAnalyticsService {
  // Get trending tokens
  async getTrendingTokens(network = "ethereum", timeframe = "24h") {
    const query = `
      query GetTrendingTokens($network: EthereumNetwork!, $since: ISO8601DateTime!) {
        ethereum(network: $network) {
          dexTrades(
            date: {since: $since}
            options: {desc: "tradeAmount", limit: 50}
          ) {
            baseCurrency {
              address
              symbol
              name
            }
            tradeAmount(in: USD)
            trades: count
            maximum_price: quotePrice(calculate: maximum)
            minimum_price: quotePrice(calculate: minimum)
          }
        }
      }
    `;

    const since = new Date();
    since.setHours(since.getHours() - (timeframe === "24h" ? 24 : 168));

    return bitQueryClient.query(query, {
      network,
      since: since.toISOString()
    });
  }

  // Get token price history
  async getTokenPriceHistory(tokenAddress, network = "ethereum", days = 30) {
    const query = `
      query GetTokenPriceHistory($tokenAddress: String!, $network: EthereumNetwork!, $since: ISO8601DateTime!) {
        ethereum(network: $network) {
          dexTrades(
            options: {asc: "timeInterval.minute"}
            date: {since: $since}
            baseCurrency: {is: $tokenAddress}
            tradeAmountUsd: {gt: 10}
          ) {
            timeInterval {
              minute(count: 60, format: "%Y-%m-%d %H:%M:%S")
            }
            volume: tradeAmount(in: USD)
            high: quotePrice(calculate: maximum)
            low: quotePrice(calculate: minimum)
            open: quotePrice(calculate: minimum)
            close: quotePrice(calculate: maximum)
            trades: count
          }
        }
      }
    `;

    const since = new Date();
    since.setDate(since.getDate() - days);

    return bitQueryClient.query(query, {
      tokenAddress,
      network,
      since: since.toISOString()
    });
  }

  // Get whale movements
  async getWhaleMovements(tokenAddress, network = "ethereum", minAmount = 100000) {
    const query = `
      query GetWhaleMovements($tokenAddress: String!, $network: EthereumNetwork!, $minAmount: Float!) {
        ethereum(network: $network) {
          transfers(
            currency: {is: $tokenAddress}
            amount: {gteq: $minAmount}
            options: {limit: 100, desc: "block.timestamp.time"}
          ) {
            block {
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
              }
            }
            transaction {
              hash
            }
            sender {
              address
              annotation
            }
            receiver {
              address
              annotation
            }
            amount
            amountInUSD: amount(in: USD)
            currency {
              symbol
              name
            }
          }
        }
      }
    `;

    return bitQueryClient.query(query, {
      tokenAddress,
      network,
      minAmount
    });
  }

  // Get DEX analytics
  async getDEXAnalytics(exchangeName, network = "ethereum", timeframe = "24h") {
    const query = `
      query GetDEXAnalytics($exchange: String!, $network: EthereumNetwork!, $since: ISO8601DateTime!) {
        ethereum(network: $network) {
          dexTrades(
            date: {since: $since}
            exchangeName: {is: $exchange}
          ) {
            count
            volume: tradeAmount(in: USD)
            medianTxAmount: tradeAmount(in: USD, calculate: median)
            traders: count(uniq: senders)
          }
        }
      }
    `;

    const since = new Date();
    since.setHours(since.getHours() - (timeframe === "24h" ? 24 : 168));

    return bitQueryClient.query(query, {
      exchange: exchangeName,
      network,
      since: since.toISOString()
    });
  }
}

export const cryptoAnalytics = new CryptoAnalyticsService();
```

### **3. React Integration**

```jsx
// src/features/crypto/components/CryptoDashboard.jsx
import React, { useState, useEffect } from "react";
import { Card, Table, Spin, Alert, Row, Col, Statistic } from "antd";
import { cryptoAnalytics } from "../services/cryptoAnalytics";

const CryptoDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    trending: [],
    whaleMovements: [],
    dexStats: null
  });

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);

        const [trendingData, whaleData, dexData] = await Promise.all([
          cryptoAnalytics.getTrendingTokens(),
          cryptoAnalytics.getWhaleMovements("0xA0b86a33E6441b4FDbF05E6bCEB9CDFb4F5a02f6"), // WETH
          cryptoAnalytics.getDEXAnalytics("Uniswap")
        ]);

        setData({
          trending: trendingData.ethereum.dexTrades,
          whaleMovements: whaleData.ethereum.transfers,
          dexStats: dexData.ethereum.dexTrades[0]
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" />
        <p className="mt-4">Loading crypto analytics...</p>
      </div>
    );
  }

  if (error) {
    return <Alert message="Error Loading Data" description={error} type="error" showIcon />;
  }

  const trendingColumns = [
    {
      title: "Token",
      dataIndex: ["baseCurrency", "symbol"],
      key: "symbol",
      render: (symbol, record) => (
        <div>
          <strong>{symbol}</strong>
          <br />
          <small>{record.baseCurrency.name}</small>
        </div>
      )
    },
    {
      title: "Volume (24h)",
      dataIndex: "tradeAmount",
      key: "volume",
      render: (amount) => `$${Number(amount).toLocaleString()}`
    },
    {
      title: "Trades",
      dataIndex: "trades",
      key: "trades"
    },
    {
      title: "Price Range",
      key: "priceRange",
      render: (_, record) => (
        <div>
          <div>High: ${Number(record.maximum_price).toFixed(4)}</div>
          <div>Low: ${Number(record.minimum_price).toFixed(4)}</div>
        </div>
      )
    }
  ];

  return (
    <div className="crypto-dashboard">
      <h1>Crypto Analytics Dashboard</h1>

      {/* DEX Statistics */}
      {data.dexStats && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic title="Total Trades (24h)" value={data.dexStats.count} precision={0} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Volume (24h)" value={data.dexStats.volume} precision={0} prefix="$" />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Traders (24h)" value={data.dexStats.traders} precision={0} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Median Trade" value={data.dexStats.medianTxAmount} precision={2} prefix="$" />
            </Card>
          </Col>
        </Row>
      )}

      {/* Trending Tokens */}
      <Card title="Trending Tokens (24h)" className="mb-6">
        <Table
          dataSource={data.trending}
          columns={trendingColumns}
          rowKey={(record) => record.baseCurrency.address}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Whale Movements */}
      <Card title="Recent Whale Movements">
        <Table
          dataSource={data.whaleMovements}
          columns={[
            {
              title: "Time",
              dataIndex: ["block", "timestamp", "time"],
              key: "time"
            },
            {
              title: "From",
              dataIndex: ["sender", "address"],
              key: "from",
              render: (address) => (
                <code>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </code>
              )
            },
            {
              title: "To",
              dataIndex: ["receiver", "address"],
              key: "to",
              render: (address) => (
                <code>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </code>
              )
            },
            {
              title: "Amount",
              dataIndex: "amount",
              key: "amount",
              render: (amount, record) => (
                <div>
                  <div>
                    {Number(amount).toLocaleString()} {record.currency.symbol}
                  </div>
                  <small>${Number(record.amountInUSD).toLocaleString()}</small>
                </div>
              )
            },
            {
              title: "Tx Hash",
              dataIndex: ["transaction", "hash"],
              key: "hash",
              render: (hash) => (
                <a href={`https://etherscan.io/tx/${hash}`} target="_blank" rel="noopener noreferrer">
                  {hash.slice(0, 8)}...
                </a>
              )
            }
          ]}
          rowKey={(record) => record.transaction.hash}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default CryptoDashboard;
```

## 🔧 **Setup and Configuration**

### **1. Environment Variables**

```bash
# .env
VITE_BITQUERY_API_KEY=your_bitquery_api_key_here
VITE_BITQUERY_ENDPOINT=https://graphql.bitquery.io
```

### **2. Installation**

```bash
npm install axios graphql
```

### **3. API Key Setup**

1. Visit [BitQuery.io](https://bitquery.io)
2. Sign up for an account
3. Get your API key from the dashboard
4. Add it to your environment variables

## 📊 **Use Cases for BitQuery**

### **1. DeFi Analytics**

- Track DEX trading volumes
- Monitor liquidity pools
- Analyze yield farming data

### **2. NFT Marketplace**

- Real-time NFT sales data
- Collection analytics
- Rarity and pricing insights

### **3. Portfolio Tracking**

- Multi-wallet portfolio management
- Real-time balance updates
- Transaction history

### **4. Trading Tools**

- Whale movement alerts
- Token analytics
- Market sentiment analysis

### **5. Research & Analytics**

- Blockchain data analysis
- Market research
- Academic studies

## 🎯 **Integration with Your Movie App**

While BitQuery is primarily for blockchain data, you could potentially:

1. **Add crypto payments** for premium features
2. **Create NFT collections** for movie collectibles
3. **Build DeFi features** for movie financing
4. **Add tokenized rewards** for users

## ⚠️ **Important Considerations**

### **Rate Limits**

- Free tier: Limited queries per month
- Paid plans: Higher rate limits
- Consider caching strategies

### **Cost Management**

- Monitor API usage
- Implement query optimization
- Use pagination effectively

### **Data Freshness**

- Real-time vs historical data
- WebSocket connections for live updates
- Caching strategies for performance

BitQuery is an incredibly powerful tool for blockchain data analysis and can add sophisticated crypto/DeFi features to any application! 🚀
