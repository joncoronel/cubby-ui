"use client";

import * as React from "react";
import { Button } from "@/registry/default/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/registry/default/card/card";
import { Input } from "@/registry/default/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/default/select/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/default/table/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/registry/default/dialog/dialog";
import { DateRangePicker } from "@/registry/default/date-range-picker/date-range-picker";
import { Progress } from "@/registry/default/progress/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/registry/default/dropdown-menu/dropdown-menu";
import { Badge } from "@/registry/default/badge/badge";
import { toast } from "@/registry/default/toast/toast";
import type { DateRange } from "react-day-picker";
import { Combobox } from "@/registry/default/combobox/combobox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsPanels,
} from "@/registry/default/tabs/tabs";
import { Switch } from "@/registry/default/switch/switch";
import { Checkbox } from "@/registry/default/checkbox/checkbox";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  MoreVerticalIcon,
  DownloadIcon,
  PlusIcon,
  FilterIcon,
  SearchIcon,
  CalendarIcon,
} from "lucide-react";

export function LandingShowcase() {
  const [range, setRange] = React.useState<DateRange | undefined>();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // Filter states
  const [showIncome, setShowIncome] = React.useState(true);
  const [showExpenses, setShowExpenses] = React.useState(true);
  const [showCleared, setShowCleared] = React.useState(true);
  const [showPending, setShowPending] = React.useState(false);

  const addTransaction = () =>
    toast.success({
      title: "Transaction added",
      description: "Your transaction has been recorded successfully.",
    });

  const exportData = async () => {
    await toast.promise(new Promise((r) => setTimeout(r, 1200)), {
      loading: "Preparing export...",
      success: "Your data is ready for download",
      error: "Export failed. Please try again.",
    });
  };

  return (
    <div className="bg-muted rounded-lg border p-1">
      <div className="bg-background rounded-md border">
        <Tabs defaultValue="dashboard" className="w-full">
          <div className="flex flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger
                value="dashboard"
                className="flex-1 text-xs sm:flex-none sm:text-sm"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="flex-1 text-xs sm:flex-none sm:text-sm"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex-1 text-xs sm:flex-none sm:text-sm"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="flex-1 text-xs sm:flex-none sm:text-sm"
              >
                Settings
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                className="flex-1 sm:flex-none"
              >
                <DownloadIcon className="size-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Dialog>
                <DialogTrigger
                  render={<Button size="sm" className="flex-1 sm:flex-none" />}
                >
                  <PlusIcon className="size-3.5 sm:mr-1.5" />
                  <span className="hidden sm:inline">New Transaction</span>
                  <span className="sm:hidden">New</span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>
                      Enter the transaction details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Description</label>
                      <Input placeholder="e.g., Grocery shopping" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input type="number" placeholder="0.00" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select defaultValue="expense">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="expense">Expense</SelectItem>
                            <SelectItem value="income">Income</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Category</label>
                        <Select defaultValue="groceries">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="groceries">Groceries</SelectItem>
                            <SelectItem value="dining">Dining Out</SelectItem>
                            <SelectItem value="transport">Transport</SelectItem>
                            <SelectItem value="utilities">Utilities</SelectItem>
                            <SelectItem value="entertainment">
                              Entertainment
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Account</label>
                        <Select defaultValue="checking">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                            <SelectItem value="credit">Credit Card</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                      Cancel
                    </DialogClose>
                    <DialogClose render={<Button onClick={addTransaction} />}>
                      Add Transaction
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <TabsPanels>
            <TabsContent
              animate={true}
              value="dashboard"
              className="px-3 pb-6 sm:px-6"
            >
              {/* Metrics Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Balance
                    </CardTitle>
                    <DollarSignIcon className="text-muted-foreground size-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$24,892.56</div>
                    <p className="text-muted-foreground text-xs">
                      <span className="text-green-600 dark:text-green-400">
                        +12.5%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Monthly Income
                    </CardTitle>
                    <TrendingUpIcon className="text-muted-foreground size-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$6,240.00</div>
                    <p className="text-muted-foreground text-xs">
                      <span className="text-green-600 dark:text-green-400">
                        +4.1%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Monthly Expenses
                    </CardTitle>
                    <TrendingDownIcon className="text-muted-foreground size-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$3,847.32</div>
                    <p className="text-muted-foreground text-xs">
                      <span className="text-red-600 dark:text-red-400">
                        +2.4%
                      </span>{" "}
                      from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Savings Rate
                    </CardTitle>
                    <Badge variant="secondary">Goal: 40%</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">38.3%</div>
                    <Progress value={38.3} className="mt-2" />
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Budget Overview */}
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Budget Overview</CardTitle>
                    <CardDescription className="text-xs">
                      Your spending across categories this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">Groceries</span>
                        <span className="text-muted-foreground text-xs whitespace-nowrap sm:text-sm">
                          $248 / $400
                        </span>
                      </div>
                      <Progress value={62} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">Dining Out</span>
                        <span className="text-muted-foreground text-xs whitespace-nowrap sm:text-sm">
                          $142 / $200
                        </span>
                      </div>
                      <Progress value={71} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">Transport</span>
                        <span className="text-muted-foreground text-xs whitespace-nowrap sm:text-sm">
                          $85 / $300
                        </span>
                      </div>
                      <Progress value={28} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate">Entertainment</span>
                        <span className="text-muted-foreground text-xs whitespace-nowrap sm:text-sm">
                          $120 / $150
                        </span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-base">Recent Activity</CardTitle>
                    <CardDescription className="text-xs">
                      Your latest transactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-x-auto px-0 sm:px-6">
                    <div className="min-w-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">Date</TableHead>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="text-muted-foreground text-xs">
                              Today
                            </TableCell>
                            <TableCell className="font-medium">
                              Whole Foods
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                Groceries
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              -$67.42
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground text-xs">
                              Yesterday
                            </TableCell>
                            <TableCell className="font-medium">
                              Netflix
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                Entertainment
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              -$15.99
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground text-xs">
                              Aug 5
                            </TableCell>
                            <TableCell className="font-medium">Uber</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                Transport
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              -$24.50
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="text-muted-foreground text-xs">
                              Aug 4
                            </TableCell>
                            <TableCell className="font-medium">
                              Chipotle
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                Dining
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              -$18.75
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent
              animate={true}
              value="transactions"
              className="px-3 pb-6 sm:px-6"
            >
              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <CardTitle>Transaction History</CardTitle>
                      <CardDescription>
                        Manage and review all your transactions
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                      <div className="relative flex-1 sm:flex-none">
                        <SearchIcon className="text-muted-foreground absolute top-2.5 left-2.5 size-4" />
                        <Input
                          placeholder="Search..."
                          className="w-full pl-8 sm:w-48 lg:w-64"
                          value={search}
                          onChange={(e) => setSearch(e.currentTarget.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <DateRangePicker
                          value={range}
                          onSelect={setRange}
                          className="flex-1 sm:flex-none"
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="outline" size="sm" />}
                          >
                            <FilterIcon className="size-3.5 sm:mr-1.5" />
                            <span className="hidden sm:inline">Filter</span>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                              Transaction Type
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                              checked={showIncome}
                              onCheckedChange={setShowIncome}
                            >
                              Income
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={showExpenses}
                              onCheckedChange={setShowExpenses}
                            >
                              Expenses
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                              checked={showCleared}
                              onCheckedChange={setShowCleared}
                            >
                              Cleared
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                              checked={showPending}
                              onCheckedChange={setShowPending}
                            >
                              Pending
                            </DropdownMenuCheckboxItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto px-0 sm:px-6">
                  <div className="min-w-[600px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={selectedIds.size === 5}
                              onCheckedChange={(checked) => {
                                setSelectedIds(
                                  new Set(
                                    checked
                                      ? ["t1", "t2", "t3", "t4", "t5"]
                                      : [],
                                  ),
                                );
                              }}
                            />
                          </TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Account</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[
                          {
                            id: "t1",
                            date: "Aug 08, 2025",
                            desc: "Whole Foods Market",
                            cat: "Groceries",
                            acc: "Chase Checking",
                            amt: -67.42,
                            status: "cleared",
                          },
                          {
                            id: "t2",
                            date: "Aug 07, 2025",
                            desc: "Netflix Subscription",
                            cat: "Entertainment",
                            acc: "Chase Sapphire",
                            amt: -15.99,
                            status: "cleared",
                          },
                          {
                            id: "t3",
                            date: "Aug 05, 2025",
                            desc: "Uber Technologies",
                            cat: "Transport",
                            acc: "Chase Checking",
                            amt: -24.5,
                            status: "cleared",
                          },
                          {
                            id: "t4",
                            date: "Aug 04, 2025",
                            desc: "Chipotle Mexican Grill",
                            cat: "Dining",
                            acc: "Chase Sapphire",
                            amt: -18.75,
                            status: "pending",
                          },
                          {
                            id: "t5",
                            date: "Aug 01, 2025",
                            desc: "Salary Deposit",
                            cat: "Income",
                            acc: "Chase Checking",
                            amt: 3120.0,
                            status: "cleared",
                          },
                        ].map((t) => (
                          <TableRow key={t.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedIds.has(t.id)}
                                onCheckedChange={(checked) => {
                                  setSelectedIds((prev) => {
                                    const next = new Set(prev);
                                    if (checked) next.add(t.id);
                                    else next.delete(t.id);
                                    return next;
                                  });
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {t.date}
                            </TableCell>
                            <TableCell className="font-medium">
                              {t.desc}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  t.cat === "Income" ? "default" : "outline"
                                }
                                className="text-xs"
                              >
                                {t.cat}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {t.acc}
                            </TableCell>
                            <TableCell
                              className={`text-right font-medium ${
                                t.amt > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : ""
                              }`}
                            >
                              {t.amt > 0 ? "+" : ""}$
                              {Math.abs(t.amt).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={<Button variant="ghost" size="sm" />}
                                >
                                  <MoreVerticalIcon className="size-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent
              animate={true}
              value="analytics"
              className="px-3 pb-6 sm:px-6"
            >
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending Analytics</CardTitle>
                    <CardDescription>
                      Visualize your spending patterns and trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                          Average Daily Spend
                        </p>
                        <p className="text-2xl font-bold">$128.24</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                          Highest Category
                        </p>
                        <p className="text-2xl font-bold">Groceries</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                          Transactions This Month
                        </p>
                        <p className="text-2xl font-bold">47</p>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <p className="text-muted-foreground mb-4 text-center text-sm">
                        Spending by Category (Last 30 days)
                      </p>
                      <div className="space-y-3">
                        {[
                          {
                            category: "Groceries",
                            amount: 892,
                            percentage: 32,
                          },
                          {
                            category: "Rent & Utilities",
                            amount: 1650,
                            percentage: 59,
                          },
                          { category: "Transport", amount: 245, percentage: 9 },
                          { category: "Dining", amount: 318, percentage: 11 },
                          {
                            category: "Entertainment",
                            amount: 156,
                            percentage: 6,
                          },
                        ].map((item) => (
                          <div key={item.category} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.category}</span>
                              <span className="text-muted-foreground">
                                ${item.amount} ({item.percentage}%)
                              </span>
                            </div>
                            <Progress value={item.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent
              animate={true}
              value="settings"
              className="px-3 pb-6 sm:px-6"
            >
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>
                      Manage your account preferences and notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">
                            Email Notifications
                          </label>
                          <p className="text-muted-foreground text-xs">
                            Receive email updates about your transactions
                          </p>
                        </div>
                        <Switch
                          checked={notificationsEnabled}
                          onCheckedChange={setNotificationsEnabled}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">
                            Two-Factor Authentication
                          </label>
                          <p className="text-muted-foreground text-xs">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">
                            Auto-categorization
                          </label>
                          <p className="text-muted-foreground text-xs">
                            Automatically categorize transactions based on
                            merchant
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="border-t pt-6">
                      <h4 className="mb-4 text-sm font-medium">
                        Connected Accounts
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-muted size-8 rounded-full" />
                            <div>
                              <p className="text-sm font-medium">
                                Chase Checking ****4892
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Connected 3 months ago
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Disconnect
                          </Button>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-muted size-8 rounded-full" />
                            <div>
                              <p className="text-sm font-medium">
                                Chase Sapphire ****7623
                              </p>
                              <p className="text-muted-foreground text-xs">
                                Connected 2 weeks ago
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Disconnect
                          </Button>
                        </div>
                      </div>
                      <Button variant="outline" className="mt-3 w-full">
                        <PlusIcon className="mr-1.5 size-3.5" />
                        Add Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </TabsPanels>
        </Tabs>
      </div>
    </div>
  );
}
