import React, { useState, useEffect } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
	id: string;
	title: string;
	value: number;
	formattedValue: string;
	formattedDate: string;
	type: 'income' | 'outcome';
	category: { title: string };
	created_at: Date;
}

interface Balance {
	income: number;
	outcome: number;
	total: number;
}

interface TransactionsRequest {
	balance: Balance,
	transactions: Transaction[]
}

const Dashboard: React.FC = () => {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [balance, setBalance] = useState<Balance>({} as Balance);

	useEffect(() => {
		async function loadTransactions(): Promise<void> {
			const result = await api.get<TransactionsRequest>('/transactions');
			setBalance(result.data.balance);
			setTransactions(result.data.transactions);
		}

		loadTransactions();
	}, []);

	function formatCurrency(value: number) {
		return Intl.NumberFormat('pt-BR',{style:'currency', currency:'BRL'}).format(value).replace(/-/, '- ');;
	}

	const formattedIncome = formatCurrency(balance.income);
	const formattedOutcome = formatCurrency(balance.outcome);
	const formattedTotal = formatCurrency(balance.total);

	return (
		<>
			<Header />
			<Container>
				<CardContainer>
					<Card>
						<header>
							<p>Entradas</p>
							<img src={income} alt="Income" />
						</header>
						<h1 data-testid="balance-income">{formattedIncome}</h1>
					</Card>
					<Card>
						<header>
							<p>Saídas</p>
							<img src={outcome} alt="Outcome" />
						</header>
						<h1 data-testid="balance-outcome">{formattedOutcome}</h1>
					</Card>
					<Card total>
						<header>
							<p>Total</p>
							<img src={total} alt="Total" />
						</header>
						<h1 data-testid="balance-total">{formattedTotal}</h1>
					</Card>
				</CardContainer>

				<TableContainer>
					<table>
						<thead>
							<tr>
								<th>Título</th>
								<th>Preço</th>
								<th>Categoria</th>
								<th>Data</th>
							</tr>
						</thead>

						<tbody>
							{transactions && transactions.map(t => <TransactionRow key={t.id} transaction={t} />)}
						</tbody>
					</table>
				</TableContainer>
			</Container>
		</>
	);
};


const TransactionRow: React.FC<{transaction:Transaction}> = ({transaction}) => {

	function formatCurrency(value: number, type: string) {
		return Intl.NumberFormat('pt-BR',{style:'currency', currency:'BRL'}).format(value);
	}

	function formatDate(value: Date) {
		return Intl.DateTimeFormat('pt-BR').format(new Date(value));
	}

	transaction.formattedValue = formatCurrency(transaction.value,transaction.type);
	transaction.formattedDate = formatDate(transaction.created_at);

	return (
		<tr>
			<td className="title">{transaction.title}</td>
			<td className={transaction.type.toLowerCase()}>{transaction.formattedValue}</td>
			<td>{transaction.category.title}</td>
			<td>{transaction.formattedDate}</td>
		</tr>
	)
}

export default Dashboard;
