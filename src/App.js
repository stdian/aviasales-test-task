import React from 'react'

import Logo from './assets/Logo.png';
import Unchecked from './assets/Unchecked.svg';
import Checked from './assets/Checked.svg';

import './App.css';

function flightDate(date, duration) {
	let d = new Date(date)
	let d1 =  (d.getUTCHours() < 10 ? '0' : '') + d.getUTCHours().toString() + ':' + (d.getUTCMinutes() < 10 ? '0' : '') +  d.getUTCMinutes().toString()
	let d2 = (new Date(d.getTime() + duration * 60000).getUTCHours() < 10 ? '0' : '')
			 + new Date(d.getTime() + duration * 60000).getUTCHours().toString() + ':'
			 + (new Date(d.getTime() + duration * 60000).getUTCMinutes() < 10 ? '0' : '')
			 + new Date(d.getTime() + duration * 60000).getUTCMinutes().toString()
	return d1 + ' - ' + d2
}

function flightDuration(duration) {
	let h = Math.floor(duration / 60)
	let m = duration % 60
	return h + 'ч ' + m + 'м'
}

function getStopsTitle(stops) {
	if (stops.length === 0) return 'без пересадок'
	if (stops.length === 1) return '1 пересадка'
	if (stops.length >= 2 && stops.length <= 4) return stops.length + ' пересадки'
	return stops.length + ' пересадок'
}

function Tickets(props) {
	console.log(props);
	let tickets = props.tickets
	let sortBy = props.sortBy
	let filter = props.filter

	let filtered_tickets = []

	if (filter.indexOf('all') === -1) {
		filter.forEach(elem => {
			if (parseInt(elem) === 0) {
				for (let i = 0; i < tickets.length; i++) {
					if (tickets[i].segments[0].stops.length + tickets[i].segments[1].stops.length === 0) {
						filtered_tickets.push(tickets[i])
					}
				}
			} else {
				for (let i = 0; i < tickets.length; i++) {
					if (tickets[i].segments[0].stops.length <= parseInt(elem) &&
						tickets[i].segments[1].stops.length <= parseInt(elem) &&
						(tickets[i].segments[0].stops.length === parseInt(elem) ||
						tickets[i].segments[1].stops.length === parseInt(elem))) {
						filtered_tickets.push(tickets[i])
					}
				}
			}
		});
	}

	if (filtered_tickets.length !== 0) {
		tickets = [...new Set(filtered_tickets)]
	}

	if (sortBy === 'price') {
		tickets = tickets.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
	}
	if (sortBy === 'time') {
		tickets = tickets.sort((a, b) => (a.segments[0].duration + a.segments[1].duration) - (b.segments[0].duration + b.segments[1].duration));
	}

	return (
		<div className="App-content-tickets">
			{tickets.slice(0, 5).map(ticket => Ticket(ticket))}
		</div>
	)
}

function Ticket(ticket) {
	return (
		<div className="App-ticket">
			<div className="App-ticket-header">
				<p className="App-ticket-price">{ticket.price} Р</p>
				<img className="App-ticket-carrier-logo" src={'http://pics.avs.io/99/36/' + ticket.carrier + '.png'} alt={'err'}></img>
			</div>
			<div className="App-ticket-content">
				<table className="App-ticket-table">
					<tbody>
						<tr>
							<td>
								<p className="App-ticket-table-gray">{ticket.segments[0].origin} - {ticket.segments[0].destination}</p>
								<p className="App-ticket-table-black">{flightDate(ticket.segments[0].date, ticket.segments[0].duration)}</p>
							</td>
							<td>
								<p className="App-ticket-table-gray">В пути</p>
								<p className="App-ticket-table-black">{flightDuration(ticket.segments[0].duration)}</p>
							</td>
							<td>
								<p className="App-ticket-table-gray">{getStopsTitle(ticket.segments[0].stops)}</p>
								<p className="App-ticket-table-black">{ticket.segments[0].stops.join(', ')}</p>
							</td>
						</tr>
						<tr>
							<td>
								<p className="App-ticket-table-gray">{ticket.segments[1].origin} - {ticket.segments[1].destination}</p>
								<p className="App-ticket-table-black">{flightDate(ticket.segments[1].date, ticket.segments[1].duration)}</p>
							</td>
							<td>
								<p className="App-ticket-table-gray">В пути</p>
								<p className="App-ticket-table-black">{flightDuration(ticket.segments[1].duration)}</p>
							</td>
							<td>
								<p className="App-ticket-table-gray">{getStopsTitle(ticket.segments[1].stops)}</p>
								<p className="App-ticket-table-black">{ticket.segments[1].stops.join(', ')}</p>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	)
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			tickets: [],
			searchID: '',
			stopSearch: false,
			sortBy: 'price',
			filter: ['all', '0', '1', '2', '3'],
			isLoading: true,
		};
	}

	async getPackOfTickets() {
		if (!this.state.stopSearch) {
			fetch("https://front-test.beta.aviasales.ru/tickets?searchId=" + this.state.searchID)
			.then(response => {
				if (response.status === 200) return response.json()
				return {error: response.status}
			})
			.then(json => {
				if ('error' in json) {
					this.getPackOfTickets()
				} else {
					let tickets = this.state.tickets
					tickets = tickets.concat(json.tickets)
					this.setState({tickets: tickets})
					console.log(this.state.tickets);
					// console.log(json.tickets);
					this.setState({isLoading: false})
					if (json.stop) {
						this.setState({stopSearch: true})
					}
				}
			})
		}
	}

	async getSearchID() {
		await fetch('https://front-test.beta.aviasales.ru/search')
		.then(response => response.json())
		.then(json => {
			this.setState({searchID: json.searchId})
		})
	}

	async componentDidMount() {
		await this.getSearchID()
		this.getPackOfTickets()
	}

	toggleFilter(f) {
		let filter = this.state.filter
		if (filter.indexOf(f) === -1) {
			if (f === 'all') {
				filter = ['all', '0', '1', '2', '3']
			} else {
				filter.push(f)
			}
		} else {
			if (f !== 'all' && filter.indexOf('all') !== -1) {
				let index = filter.indexOf('all')
				filter.splice(index, 1)
			}
			let index = filter.indexOf(f)
			filter.splice(index, 1)
		}
		this.setState({filter: filter})
	}

	render() {
		if (this.state.isLoading) {
			return (<div className="Loading">Loading</div>)
		}
		return (
			<div className="App">
				<img className="App-logo" src={Logo} alt={'logo'}></img>
				<div className="App-content">
					<div className="App-content-left">
						<div className="App-content-left-filters">
							<p className="App-content-left-filters-title">Количество пересадок</p>
							<div className="App-content-left-filter" onClick={() => this.toggleFilter('all')}>
								{this.state.filter.indexOf('all') === -1 ? <img src={Unchecked} alt={'err'}></img> : <img src={Checked} alt={'err'}></img>}
								<p>Все</p>
							</div>
							<div className="App-content-left-filter" onClick={() => this.toggleFilter('0')}>
								{this.state.filter.indexOf('0') === -1 ? <img src={Unchecked} alt={'err'}></img> : <img src={Checked} alt={'err'}></img>}
								<p>Без пересадок</p>
							</div>
							<div className="App-content-left-filter" onClick={() => this.toggleFilter('1')}>
								{this.state.filter.indexOf('1') === -1 ? <img src={Unchecked} alt={'err'}></img> : <img src={Checked} alt={'err'}></img>}
								<p>1 пересадка</p>
							</div>
							<div className="App-content-left-filter" onClick={() => this.toggleFilter('2')}>
								{this.state.filter.indexOf('2') === -1 ? <img src={Unchecked} alt={'err'}></img> : <img src={Checked} alt={'err'}></img>}
								<p>2 пересадки</p>
							</div>
							<div className="App-content-left-filter" onClick={() => this.toggleFilter('3')}>
								{this.state.filter.indexOf('3') === -1 ? <img src={Unchecked} alt={'err'}></img> : <img src={Checked} alt={'err'}></img>}
								<p>3 пересадки</p>
							</div>
						</div>
					</div>
					<div className="App-content-right">
						<div className="App-content-tabs">
							<div onClick={() => {this.setState({sortBy: 'price'})}} className={this.state.sortBy === 'price' ? 'App-content-tab-active App-content-tab App-content-tab-left' : 'App-content-tab App-content-tab-left'}><p>Самый дешевый</p></div>
							<div onClick={() => {this.setState({sortBy: 'time'})}} className={this.state.sortBy === 'time' ? 'App-content-tab-active App-content-tab App-content-tab-right' : 'App-content-tab App-content-tab-right'}><p>Самый быстрый</p></div>
						</div>
						<Tickets tickets={this.state.tickets} sortBy={this.state.sortBy} filter={this.state.filter} />
					</div>
				</div>
			</div>
		)
	}
}

export default App;
