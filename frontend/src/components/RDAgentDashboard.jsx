import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Brain, Code, TrendingUp, Shield, Zap, Target, GitBranch, Cpu } from 'lucide-react';

const RDAgentDashboard = () => {
  const [currentStage, setCurrentStage] = useState('research');
  const [progress, setProgress] = useState({
    research: 85,
    development: 65,
    agent: 40,
    quant: 75
  });

  const [factors, setFactors] = useState([
    { id: 1, name: 'Momentum Factor', confidence: 0.87, status: 'validated' },
    { id: 2, name: 'Mean Reversion', confidence: 0.72, status: 'testing' },
    { id: 3, name: 'Volume Profile', confidence: 0.91, status: 'validated' },
    { id: 4, name: 'Sentiment Score', confidence: 0.68, status: 'research' }
  ]);

  const [agents, setAgents] = useState([
    { id: 1, name: 'Research Agent', status: 'active', task: 'Factor Discovery' },
    { id: 2, name: 'Development Agent', status: 'active', task: 'Strategy Implementation' },
    { id: 3, name: 'Risk Agent', status: 'monitoring', task: 'Risk Assessment' },
    { id: 4, name: 'Execution Agent', status: 'standby', task: 'Trade Execution' }
  ]);

  const [strategies, setStrategies] = useState([
    { id: 1, name: 'SOL/USDC Momentum', performance: 12.5, sharpe: 1.8, status: 'live' },
    { id: 2, name: 'Multi-Asset Mean Rev', performance: 8.3, sharpe: 1.4, status: 'testing' },
    { id: 3, name: 'Sentiment Arbitrage', performance: 15.2, sharpe: 2.1, status: 'development' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => ({
        research: Math.min(100, prev.research + Math.random() * 2),
        development: Math.min(100, prev.development + Math.random() * 1.5),
        agent: Math.min(100, prev.agent + Math.random() * 3),
        quant: Math.min(100, prev.quant + Math.random() * 1)
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated':
      case 'active':
      case 'live':
        return 'default';
      case 'testing':
      case 'monitoring':
        return 'secondary';
      case 'research':
      case 'development':
      case 'standby':
        return 'outline';
      default:
        return 'destructive';
    }
  };

  const performanceData = [
    { month: 'Jan', rdAgent: 18.7, classical: 9.2, benchmark: 5.1 },
    { month: 'Feb', rdAgent: 22.3, classical: 11.8, benchmark: 6.7 },
    { month: 'Mar', rdAgent: 28.9, classical: 14.2, benchmark: 8.3 },
    { month: 'Apr', rdAgent: 35.6, classical: 16.9, benchmark: 9.8 },
    { month: 'May', rdAgent: 42.1, classical: 19.4, benchmark: 11.2 }
  ];

  const factorEfficiencyData = [
    { category: 'R&D-Agent-Quant', factors: 23, performance: 42.1, efficiency: 1.83 },
    { category: 'Classical Libraries', factors: 76, performance: 19.4, efficiency: 0.26 },
    { category: 'Deep Learning', factors: 45, performance: 24.7, efficiency: 0.55 }
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            R&D-Agent-Quant Framework
          </h1>
          <p className="text-lg text-gray-600">
            Autonomous Research, Development, and Quantitative Trading Platform
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Research Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {Math.round(progress.research)}%
              </div>
              <Progress value={progress.research} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Development Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {Math.round(progress.development)}%
              </div>
              <Progress value={progress.development} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Agent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {Math.round(progress.agent)}%
              </div>
              <Progress value={progress.agent} className="h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Quant Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {Math.round(progress.quant)}%
              </div>
              <Progress value={progress.quant} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={currentStage} onValueChange={setCurrentStage}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="agent">Agent Framework</TabsTrigger>
            <TabsTrigger value="quant">Quant Strategies</TabsTrigger>
          </TabsList>

          {/* Research Tab */}
          <TabsContent value="research" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Factor Discovery Engine</CardTitle>
                  <CardDescription>
                    Automated discovery and validation of trading factors
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {factors.map((factor) => (
                      <div key={factor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{factor.name}</div>
                          <div className="text-sm text-gray-600">
                            Confidence: {(factor.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                        <Badge variant={getStatusColor(factor.status)}>
                          {factor.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Research Metrics</CardTitle>
                  <CardDescription>
                    Current research pipeline status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Hypothesis Generated</span>
                      <span className="text-2xl font-bold text-blue-600">247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Factors Validated</span>
                      <span className="text-2xl font-bold text-green-600">89</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Papers Analyzed</span>
                      <span className="text-2xl font-bold text-purple-600">1,432</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-2xl font-bold text-orange-600">36%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Development Tab */}
          <TabsContent value="development" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Development Pipeline</CardTitle>
                  <CardDescription>
                    Automated strategy development and testing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium text-blue-900">Code Generation</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Generating strategy implementations from research findings
                      </div>
                      <Progress value={78} className="mt-2 h-2" />
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="font-medium text-green-900">Backtesting</div>
                      <div className="text-sm text-green-700 mt-1">
                        Running historical performance analysis
                      </div>
                      <Progress value={92} className="mt-2 h-2" />
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="font-medium text-purple-900">Optimization</div>
                      <div className="text-sm text-purple-700 mt-1">
                        Parameter tuning and risk adjustment
                      </div>
                      <Progress value={65} className="mt-2 h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Development Stats</CardTitle>
                  <CardDescription>
                    Current development metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Strategies Developed</span>
                      <span className="text-2xl font-bold text-blue-600">156</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tests Completed</span>
                      <span className="text-2xl font-bold text-green-600">2,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Code Lines Generated</span>
                      <span className="text-2xl font-bold text-purple-600">45.2K</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-2xl font-bold text-orange-600">75%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Agent Framework Tab */}
          <TabsContent value="agent" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Multi-Agent System</CardTitle>
                  <CardDescription>
                    Coordinated agents for autonomous trading
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {agents.map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-gray-600">{agent.task}</div>
                        </div>
                        <Badge variant={getStatusColor(agent.status)}>
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agent Performance</CardTitle>
                  <CardDescription>
                    Real-time agent coordination metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Agents</span>
                      <span className="text-2xl font-bold text-blue-600">4/4</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Tasks Completed</span>
                      <span className="text-2xl font-bold text-green-600">1,247</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Coordination Score</span>
                      <span className="text-2xl font-bold text-purple-600">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Uptime</span>
                      <span className="text-2xl font-bold text-orange-600">99.8%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quant Strategies Tab */}
          <TabsContent value="quant" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Active Strategies</CardTitle>
                  <CardDescription>
                    Live and testing quantitative strategies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {strategies.map((strategy) => (
                      <div key={strategy.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{strategy.name}</div>
                          <Badge variant={getStatusColor(strategy.status)}>
                            {strategy.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Performance:</span>
                            <span className="ml-2 font-medium text-green-600">
                              +{strategy.performance}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sharpe:</span>
                            <span className="ml-2 font-medium">{strategy.sharpe}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Metrics</CardTitle>
                  <CardDescription>
                    Overall portfolio performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Return</span>
                      <span className="text-2xl font-bold text-green-600">+24.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Sharpe Ratio</span>
                      <span className="text-2xl font-bold text-blue-600">1.85</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Max Drawdown</span>
                      <span className="text-2xl font-bold text-red-600">-3.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Win Rate</span>
                      <span className="text-2xl font-bold text-purple-600">72%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Performance Comparison Chart */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">R&D-Agent-Quant vs Classical Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Line type="monotone" dataKey="rdAgent" stroke="#8884d8" strokeWidth={3} name="R&D-Agent-Quant" />
                <Line type="monotone" dataKey="classical" stroke="#82ca9d" strokeWidth={2} name="Classical Methods" />
                <Line type="monotone" dataKey="benchmark" stroke="#ffc658" strokeWidth={2} name="Benchmark" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Factor Efficiency Comparison */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Factor Efficiency Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={factorEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="factors" fill="#8884d8" name="Factor Count" />
                <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RDAgentDashboard; 