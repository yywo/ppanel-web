'use client';

import { Icon } from '@iconify/react';
import { formatBytes, unitConversion } from '@repo/ui/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@shadcn/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@shadcn/ui/chart';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from '@shadcn/ui/lib/recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select';
import { Separator } from '@shadcn/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shadcn/ui/tabs';
import { useLocale } from 'next-intl';
import { useState } from 'react';

const UserStatisticsConfig = {
  register: {
    label: '注册',
    color: 'hsl(var(--chart-1))',
  },
  new_purchase: {
    label: '新购',
    color: 'hsl(var(--chart-2))',
  },
  repurchase: {
    label: '复购',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const IncomeStatisticsConfig = {
  new_purchase: {
    label: '新购',
    color: 'hsl(var(--chart-1))',
  },
  repurchase: {
    label: '复购',
    color: 'hsl(var(--chart-2))',
  },
};

// Sample data - replace with actual data
const trafficData = {
  nodes: {
    today: [
      { name: 'Node 1', traffic: 1000, type: 'Trojan', address: '127.0.0.1:443' },
      { name: 'Node 2', traffic: 800, type: 'Trojan', address: '127.0.0.1:444' },
      { name: 'Node 3', traffic: 600, type: 'Trojan', address: '127.0.0.1:445' },
      { name: 'Node 4', traffic: 400, type: 'Trojan', address: '127.0.0.1:446' },
      { name: 'Node 5', traffic: 200, type: 'Trojan', address: '127.0.0.1:447' },
      { name: 'Node 6', traffic: 1000, type: 'Trojan', address: '127.0.0.1:443' },
      { name: 'Node 7', traffic: 800, type: 'Trojan', address: '127.0.0.1:444' },
      { name: 'Node 8', traffic: 600, type: 'Trojan', address: '127.0.0.1:445' },
      { name: 'Node 9', traffic: 400, type: 'Trojan', address: '127.0.0.1:446' },
      { name: 'Node 10', traffic: 200, type: 'Trojan', address: '127.0.0.1:447' },
    ],
    yesterday: [
      { name: 'Node 1', traffic: 900, type: 'Trojan', address: '127.0.0.1:443' },
      { name: 'Node 2', traffic: 750, type: 'Trojan', address: '127.0.0.1:444' },
      { name: 'Node 3', traffic: 550, type: 'Trojan', address: '127.0.0.1:445' },
      { name: 'Node 4', traffic: 350, type: 'Trojan', address: '127.0.0.1:446' },
      { name: 'Node 5', traffic: 150, type: 'Trojan', address: '127.0.0.1:447' },
    ],
  },
  users: {
    today: [
      { name: 'olivia.martin@email.com', traffic: 100, email: 'olivia.martin@email.com' },
      { name: 'jackson.lee@email.com', traffic: 90, email: 'jackson.lee@email.com' },
      { name: 'isabella.nguyen@email.com', traffic: 80, email: 'isabella.nguyen@email.com' },
      { name: 'william.chen@email.com', traffic: 70, email: 'william.chen@email.com' },
      { name: 'sophia.rodriguez@email.com', traffic: 60, email: 'sophia.rodriguez@email.com' },
      { name: 'olivia.martin@email.com', traffic: 100, email: 'olivia.martin@email.com' },
      { name: 'jackson.lee@email.com', traffic: 90, email: 'jackson.lee@email.com' },
      { name: 'isabella.nguyen@email.com', traffic: 80, email: 'isabella.nguyen@email.com' },
      { name: 'william.chen@email.com', traffic: 70, email: 'william.chen@email.com' },
      { name: 'sophia.rodriguez@email.com', traffic: 60, email: 'sophia.rodriguez@email.com' },
    ],
    yesterday: [
      { name: 'olivia.martin@email.com', traffic: 95, email: 'olivia.martin@email.com' },
      { name: 'jackson.lee@email.com', traffic: 85, email: 'jackson.lee@email.com' },
      { name: 'isabella.nguyen@email.com', traffic: 75, email: 'isabella.nguyen@email.com' },
      { name: 'william.chen@email.com', traffic: 65, email: 'william.chen@email.com' },
      { name: 'sophia.rodriguez@email.com', traffic: 55, email: 'sophia.rodriguez@email.com' },
    ],
  },
};

export default function Statistics() {
  const locale = useLocale();

  const [dataType, setDataType] = useState<string | 'nodes' | 'users'>('nodes');
  const [timeFrame, setTimeFrame] = useState<string | 'today' | 'yesterday'>('today');

  const currentData = trafficData[dataType][timeFrame];
  return (
    <>
      <h1 className='text-lg font-semibold'>统计</h1>
      <div className='grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8'>
        {[
          {
            title: '在线IP数',
            value: '666',
            icon: 'uil:network-wired',
            onClick: () => console.log('在线IP数 clicked'),
          },
          {
            title: '在线节点数',
            value: '99',
            icon: 'uil:server-network',
            onClick: () => console.log('在线节点数 clicked'),
          },
          {
            title: '离线节点数',
            value: '1',
            icon: 'uil:server-network-alt',
            onClick: () => console.log('离线节点数 clicked'),
          },
          {
            title: '待处理工单',
            value: '1',
            icon: 'uil:clipboard-notes',
            onClick: () => console.log('待处理工单 clicked'),
          },
          {
            title: '今日上传流量',
            value: formatBytes(99999999999999),
            icon: 'uil:arrow-up',
            onClick: () => console.log('今日上传流量 clicked'),
          },
          {
            title: '今日下载流量',
            value: formatBytes(99999999999999),
            icon: 'uil:arrow-down',
            onClick: () => console.log('今日下载流量 clicked'),
          },
          {
            title: '总上传流量',
            value: formatBytes(99999999999999),
            icon: 'uil:cloud-upload',
            onClick: () => console.log('总上传流量 clicked'),
          },
          {
            title: '总下载流量',
            value: formatBytes(99999999999999),
            icon: 'uil:cloud-download',
            onClick: () => console.log('总下载流量 clicked'),
          },
        ].map((item, index) => (
          <Card key={index} onClick={item.onClick} className='cursor-pointer'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>
                <Icon icon={item.icon} className='text-2xl' />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-xl font-bold tabular-nums leading-none'>{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-3'>
        <Tabs defaultValue='today'>
          <Card>
            <CardHeader className='flex !flex-row items-center justify-between'>
              <CardTitle>收入统计</CardTitle>
              <TabsList>
                <TabsTrigger value='today'>今日</TabsTrigger>
                <TabsTrigger value='month'>本月</TabsTrigger>
                <TabsTrigger value='total'>总计</TabsTrigger>
              </TabsList>
            </CardHeader>
            <TabsContent value='today'>
              <CardContent>
                <ChartContainer config={IncomeStatisticsConfig} className='mx-auto max-h-80'>
                  <PieChart>
                    <ChartLegend content={<ChartLegendContent />} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={[
                        {
                          type: 'new_purchase',
                          value: 200,
                          fill: 'var(--color-new_purchase)',
                        },
                        {
                          type: 'repurchase',
                          value: 187,
                          fill: 'var(--color-repurchase)',
                        },
                      ]}
                      dataKey='value'
                      nameKey='type'
                      innerRadius={50}
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor='middle'
                                dominantBaseline='middle'
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className='fill-foreground text-2xl font-bold'
                                >
                                  6,666
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className='flex h-20 flex-row border-t p-4'>
                <div className='flex w-full items-center gap-2'>
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>总收入</div>
                    <div className='text-xl font-bold tabular-nums leading-none'>6,666</div>
                  </div>
                  <Separator orientation='vertical' className='mx-2 h-10 w-px' />
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {IncomeStatisticsConfig.new_purchase.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>123</div>
                  </div>
                  <Separator orientation='vertical' className='mx-2 h-10 w-px' />
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {IncomeStatisticsConfig.repurchase.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>456</div>
                  </div>
                </div>
              </CardFooter>
            </TabsContent>
            <TabsContent value='month'>
              <CardContent>
                <ChartContainer config={IncomeStatisticsConfig} className='max-h-80 w-full'>
                  <BarChart
                    accessibilityLayer
                    data={[
                      { date: '2024-10-01', new_purchase: 98, repurchase: 125 },
                      { date: '2024-10-02', new_purchase: 110, repurchase: 140 },
                      { date: '2024-10-03', new_purchase: 100, repurchase: 130 },
                      { date: '2024-10-04', new_purchase: 115, repurchase: 145 },
                      { date: '2024-10-05', new_purchase: 108, repurchase: 138 },
                      { date: '2024-10-06', new_purchase: 120, repurchase: 150 },
                    ]}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => {
                        return new Date(value).toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                    />
                    <Bar dataKey='new_purchase' fill='var(--color-new_purchase)' radius={4} />
                    <Bar dataKey='repurchase' fill='var(--color-repurchase)' radius={4} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className='flex h-20 flex-row border-t p-4'>
                <div className='flex w-full items-center gap-2'>
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>总收入</div>
                    <div className='text-xl font-bold tabular-nums leading-none'>654,321</div>
                  </div>
                  <Separator orientation='vertical' className='mx-2 h-10 w-px' />
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {IncomeStatisticsConfig.new_purchase.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>123</div>
                  </div>
                  <Separator orientation='vertical' className='mx-2 h-10 w-px' />
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {IncomeStatisticsConfig.repurchase.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>456</div>
                  </div>
                </div>
              </CardFooter>
            </TabsContent>
            <TabsContent value='total'>
              <CardContent>
                <ChartContainer config={IncomeStatisticsConfig} className='max-h-80 w-full'>
                  <AreaChart
                    accessibilityLayer
                    data={[
                      { date: '2024-07', new_purchase: 98, repurchase: 125 },
                      { date: '2024-08', new_purchase: 110, repurchase: 140 },
                      { date: '2024-09', new_purchase: 100, repurchase: 130 },
                      { date: '2024-10', new_purchase: 115, repurchase: 145 },
                      { date: '2024-11', new_purchase: 108, repurchase: 138 },
                      { date: '2024-12', new_purchase: 120, repurchase: 150 },
                    ]}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        return new Date(value).toLocaleDateString(locale, {
                          month: 'short',
                        });
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dot' />}
                    />
                    <Area
                      dataKey='new_purchase'
                      type='natural'
                      fill='var(--color-new_purchase)'
                      fillOpacity={0.4}
                      stroke='var(--color-new_purchase)'
                      stackId='a'
                    />
                    <Area
                      dataKey='repurchase'
                      type='natural'
                      fill='var(--color-repurchase)'
                      fillOpacity={0.4}
                      stroke='var(--color-repurchase)'
                      stackId='a'
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className='flex h-20 flex-row border-t p-4'>
                <div className='flex w-full items-center gap-2'>
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>总收入</div>
                    <div className='text-xl font-bold tabular-nums leading-none'>987,654,321</div>
                  </div>
                </div>
              </CardFooter>
            </TabsContent>
          </Card>
        </Tabs>
        <Tabs defaultValue='today'>
          <Card>
            <CardHeader className='flex !flex-row items-center justify-between'>
              <CardTitle>用户统计</CardTitle>
              <TabsList>
                <TabsTrigger value='today'>今日</TabsTrigger>
                <TabsTrigger value='month'>本月</TabsTrigger>
                <TabsTrigger value='total'>总计</TabsTrigger>
              </TabsList>
            </CardHeader>
            <TabsContent value='today'>
              <CardContent>
                <ChartContainer config={UserStatisticsConfig} className='mx-auto max-h-80'>
                  <PieChart>
                    <ChartLegend content={<ChartLegendContent />} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={[
                        {
                          type: 'register',
                          value: 275,
                          fill: 'var(--color-register)',
                        },
                        {
                          type: 'new_purchase',
                          value: 200,
                          fill: 'var(--color-new_purchase)',
                        },
                        {
                          type: 'repurchase',
                          value: 187,
                          fill: 'var(--color-repurchase)',
                        },
                      ]}
                      dataKey='value'
                      nameKey='type'
                      innerRadius={50}
                      strokeWidth={5}
                    >
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor='middle'
                                dominantBaseline='middle'
                              >
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className='fill-foreground text-3xl font-bold'
                                >
                                  275
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className='flex h-20 flex-row border-t p-4'>
                <div className='flex w-full items-center gap-2'>
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {UserStatisticsConfig.register.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>789</div>
                  </div>
                  <Separator orientation='vertical' className='mx-2 h-10 w-px' />
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {UserStatisticsConfig.new_purchase.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>123</div>
                  </div>
                  <Separator orientation='vertical' className='mx-2 h-10 w-px' />
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {UserStatisticsConfig.repurchase.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>456</div>
                  </div>
                </div>
              </CardFooter>
            </TabsContent>
            <TabsContent value='month'>
              <CardContent>
                <ChartContainer config={UserStatisticsConfig} className='max-h-80 w-full'>
                  <BarChart
                    accessibilityLayer
                    data={[
                      { date: '2024-10-01', register: 215, new_purchase: 98, repurchase: 125 },
                      { date: '2024-10-02', register: 240, new_purchase: 110, repurchase: 140 },
                      { date: '2024-10-03', register: 225, new_purchase: 100, repurchase: 130 },
                      { date: '2024-10-04', register: 250, new_purchase: 115, repurchase: 145 },
                      { date: '2024-10-05', register: 235, new_purchase: 108, repurchase: 138 },
                      { date: '2024-10-06', register: 260, new_purchase: 120, repurchase: 150 },
                    ]}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => {
                        return new Date(value).toLocaleDateString(locale, {
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                    />
                    <Bar dataKey='register' fill='var(--color-register)' radius={4} />
                    <Bar dataKey='new_purchase' fill='var(--color-new_purchase)' radius={4} />
                    <Bar dataKey='repurchase' fill='var(--color-repurchase)' radius={4} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className='flex h-20 flex-row border-t p-4'>
                <div className='flex w-full items-center gap-2'>
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {UserStatisticsConfig.register.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>789</div>
                  </div>
                  <Separator orientation='vertical' className='mx-2 h-10 w-px' />
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {UserStatisticsConfig.new_purchase.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>123</div>
                  </div>
                  <Separator orientation='vertical' className='mx-2 h-10 w-px' />
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {UserStatisticsConfig.repurchase.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>456</div>
                  </div>
                </div>
              </CardFooter>
            </TabsContent>
            <TabsContent value='total'>
              <CardContent>
                <ChartContainer config={UserStatisticsConfig} className='max-h-80 w-full'>
                  <AreaChart
                    accessibilityLayer
                    data={[
                      { date: '2024-07', register: 215, new_purchase: 98, repurchase: 125 },
                      { date: '2024-08', register: 240, new_purchase: 110, repurchase: 140 },
                      { date: '2024-09', register: 225, new_purchase: 100, repurchase: 130 },
                      { date: '2024-10', register: 250, new_purchase: 115, repurchase: 145 },
                      { date: '2024-11', register: 235, new_purchase: 108, repurchase: 138 },
                      { date: '2024-12', register: 260, new_purchase: 120, repurchase: 150 },
                    ]}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey='date'
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        return new Date(value).toLocaleDateString(locale, {
                          month: 'short',
                        });
                      }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator='dot' />}
                    />
                    <Area
                      dataKey='register'
                      type='natural'
                      fill='var(--color-register)'
                      fillOpacity={0.4}
                      stroke='var(--color-register)'
                      stackId='a'
                    />
                    <Area
                      dataKey='new_purchase'
                      type='natural'
                      fill='var(--color-new_purchase)'
                      fillOpacity={0.4}
                      stroke='var(--color-new_purchase)'
                      stackId='a'
                    />
                    <Area
                      dataKey='repurchase'
                      type='natural'
                      fill='var(--color-repurchase)'
                      fillOpacity={0.4}
                      stroke='var(--color-repurchase)'
                      stackId='a'
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className='flex h-20 flex-row border-t p-4'>
                <div className='flex w-full items-center gap-2'>
                  <div className='grid flex-1 auto-rows-min gap-0.5'>
                    <div className='text-muted-foreground text-xs'>
                      {UserStatisticsConfig.register.label}
                    </div>
                    <div className='text-xl font-bold tabular-nums leading-none'>987,654,321</div>
                  </div>
                </div>
              </CardFooter>
            </TabsContent>
          </Card>
        </Tabs>
        <Card>
          <CardHeader className='flex !flex-row items-center justify-between'>
            <CardTitle>流量排行</CardTitle>
            <Tabs value={timeFrame} onValueChange={setTimeFrame}>
              <TabsList>
                <TabsTrigger value='today'>今日</TabsTrigger>
                <TabsTrigger value='yesterday'>昨日</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className='mb-6 flex items-center justify-between'>
              <h4 className='font-semibold'>{dataType === 'nodes' ? '节点流量' : '用户流量'}</h4>
              <Select onValueChange={setDataType} defaultValue='nodes'>
                <SelectTrigger className='w-28'>
                  <SelectValue placeholder='选择类型' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='nodes'>节点</SelectItem>
                  <SelectItem value='users'>用户</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ChartContainer
              config={{
                traffic: {
                  label: '流量',
                  color: 'hsl(var(--primary))',
                },
                type: {
                  label: '类型',
                  color: 'hsl(var(--muted))',
                },
                email: {
                  label: '邮箱',
                  color: 'hsl(var(--muted))',
                },
                label: {
                  color: 'hsl(var(--foreground))',
                },
              }}
              className='max-h-80'
            >
              <BarChart data={currentData} layout='vertical' height={400}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  type='number'
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatBytes(unitConversion('gbToBytes', value) || 0)}
                />
                <YAxis
                  type='category'
                  dataKey='name'
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickMargin={0}
                  width={15}
                  tickFormatter={(value, index) => String(index + 1)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      label={false}
                      labelFormatter={(label) =>
                        dataType === 'nodes' ? `节点: ${label}` : `用户: ${label}`
                      }
                    />
                  }
                />
                <Bar dataKey='traffic' fill='hsl(var(--primary))' radius={[0, 4, 4, 0]}>
                  <LabelList
                    dataKey='name'
                    position='insideLeft'
                    offset={8}
                    className='fill-[--color-label]'
                    fontSize={12}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
