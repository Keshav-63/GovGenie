"use client"
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  ArrowDown,
  ArrowUp,
  Calendar,
  BarChart4,
  CheckCircle,
  DownloadCloud,
} from "lucide-react"
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Progress } from "../../components/ui/progress";
import { Label } from "../../components/ui/label";
import { formatCurrency, formatDate } from "../../lib/utils";
import { useAuthStore } from "../../store/authStore";


function Transactions() {
  const [searchQuery, setSearchQuery] = useState("")
  const [transactions, setTransactions] = useState([]);
  const [withdrawalDialog, setWithdrawalDialog] = useState(false)
  const { agentId } = useAuthStore();
  const [agentInfo, setAgentInfo] = useState(null);
  const [withdraw, setWithdraw] = useState('');



  useEffect(() => {
    if (agentId) {

      axios
        .get(`http://localhost:5000/api/agentinfo-schema/${agentId}`)
        .then((response) => {
          setAgentInfo(response.data);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [agentId]);



  
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!agentInfo) return; 
      try {
        const agentid = agentInfo._id;
        const response = await axios.get(
          `http://localhost:5000/api/transactions/agent/${agentid}`
        );
        console.log("Response Data:", response.data.transaction); 
        setTransactions(response.data.transaction); 
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, [agentInfo]);


    console.log("transss", transactions.length);
    console.log("agent info ", agentInfo);

const handleWithdraw = async () => {
  try {
    console.log("agent info id", agentInfo._id);
    const agentid = agentInfo.agentId;
    const response = await fetch(
      "http://localhost:5000/api/transactions/newagent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId :agentid, amount: withdraw }),
      }
    );

 

    const data = await response.json();
    console.log("Withdraw Response:", data);
    setWithdrawalDialog(false);
  } catch (error) {
    console.error("Error while withdraw:", error);
  }
};

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.transactionDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const creditTransactions = filteredTransactions.filter((transaction) => transaction.type === "Credit")
  const debitTransactions = filteredTransactions.filter((transaction) => transaction.type === "Debit")

  const totalEarnings = creditTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const totalWithdrawn = debitTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  const availableBalance = totalEarnings - totalWithdrawn

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Transactions & Payments
          </h2>
          <p className="text-muted-foreground">
            Manage your earnings, payouts, and transaction history.
          </p>
        </div>
        <Button onClick={() => setWithdrawalDialog(true)}>
          <DownloadCloud className="mr-2 h-4 w-4" />
          <span>Withdraw</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(agentInfo?.avaiable_balance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for withdrawal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(agentInfo?.total_earning)}
            </div>
  
          </CardContent>
        </Card>
 
      </div>

      <div className="flex flex-col items-center gap-4 md:flex-row">
  
  
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="credit">Credits</TabsTrigger>
          <TabsTrigger value="debit">Debits</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    [...filteredTransactions].reverse().map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-medium">
                          {transaction._id}
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.transactionDate)}
                        </TableCell>
                        <TableCell>
                          <div>{transaction.service}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.orderID}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.customer
                            ? transaction.customer
                            : "Withdraw"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              transaction.type === "Credit"
                                ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                            }
                          >
                            {transaction.type === "Credit" ? (
                              <ArrowDown className="mr-1 inline-block h-3 w-3" />
                            ) : (
                              <ArrowUp className="mr-1 inline-block h-3 w-3" />
                            )}
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credit">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creditTransactions.length > 0 ? (
                    [...creditTransactions].reverse().map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {transaction._id}
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.transactionDate)}
                        </TableCell>
                        <TableCell>
                          <div>{transaction.service}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.orderID}
                          </div>
                        </TableCell>
                        <TableCell>{transaction.customer}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No credit transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debit">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead></TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center"></TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {debitTransactions.length > 0 ? (
                    [...debitTransactions].reverse().map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell className="font-medium">
                          {transaction._id}
                        </TableCell>
                        <TableCell>
                          {formatDate(transaction.transactionDate)}
                        </TableCell>
                        <TableCell>
                          <div>{transaction.service}</div>
                          <div className="text-xs text-muted-foreground">
                            {transaction.orderID}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          {transaction.paymentMethod}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No debit transactions found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={withdrawalDialog} onOpenChange={setWithdrawalDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Withdraw your available balance to your bank account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="mb-2 text-sm text-muted-foreground">
                Available Balance
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(agentInfo?.avaiable_balance)}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="amount">Withdrawal Amount</Label>
              <Input
                id="amount"
                vale={withdraw}
                onChange={(e) => setWithdraw(e.target.value)}
                type="number"
                defaultValue={agentInfo?.avaiable_balance}
                max={agentInfo?.avaiable_balance}
              />
              <p className="text-xs text-muted-foreground">
          
              </p>
            </div>

            <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Instant withdrawal available
                </span>
              </div>
              <p className="mt-1 text-xs text-green-600/80 dark:text-green-400/80">
                Funds will be credited to your bank account within 30 minutes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setWithdrawalDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleWithdraw}>Withdraw</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Transactions

