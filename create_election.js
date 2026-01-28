import React, { Component } from 'react';
import { Button, Form, Grid, Header, Segment, Icon, Message } from 'semantic-ui-react';
import web3 from '../../Ethereum/web3';
import Election_Factory from '../../Ethereum/election_factory';
import { Router } from '../../routes';
import Cookies from 'js-cookie';
class LoginForm extends Component {
	state = {
		//retrieve the company's email via cookie
		election_name: '',
		election_description: '',
		loading: false,
		errorMess: '',
	};

    signin = async event => {
		event.preventDefault();
        this.setState({ loading: true, errorMess: '' });
        try {
            let email = Cookies.get('company_email');
            if (!email && typeof window !== 'undefined') {
                try { email = localStorage.getItem('company_email') || ''; } catch (e) {}
            }
            if (!email) {
                this.setState({ loading: false, errorMess: 'Missing company email in session.' });
                return;
            }

            const accounts = await web3.eth.getAccounts();
            if (!accounts || accounts.length === 0) {
                this.setState({ loading: false, errorMess: 'No wallet account available. Check MetaMask.' });
                return;
            }

            const receipt = await Election_Factory.methods
                .createElection(email, this.state.election_name, this.state.election_description)
                .send({ from: accounts[0], gas: '3000000' });

            if (receipt && receipt.status) {
                const summary = await Election_Factory.methods.getDeployedElection(email).call({ from: accounts[0] });
                Cookies.set('address', summary[0]);
                this.setState({ loading: false });
                Router.pushRoute(`/election/${summary[0]}/company_dashboard`);
                return;
            }

            this.setState({ loading: false, errorMess: 'Transaction failed. Please try again.' });
        } catch (err) {
            this.setState({ loading: false, errorMess: err && err.message ? err.message : 'Transaction rejected or failed.' });
        }
	};

	LoginForm = () => (
		<div className="login-form">
			<style JSX>{`
                .login-form {
                    width:100%;
                    height:100%;
                    position:absolute;
                    background: url('../../static/blockchain.jpg') no-repeat;
                } 
              `}</style>

			<Grid textAlign="center" style={{ height: '100%' }} verticalAlign="middle">
				<Grid.Column style={{ maxWidth: 380 }}>
                    <Form size="large" onSubmit={this.signin}>
						<Segment>
							<Header as="h2" color="black" textAlign="center" style={{ marginTop: 10 }}>
								Create an election!
							</Header>
							<Form.Input
								fluid
								iconPosition="left"
								icon="address card outline"
								placeholder="Election Name"
								style={{ padding: 5 }}
								value={this.state.election_name}
								onChange={event => this.setState({ election_name: event.target.value })}
								required={true}
							/>
                            <Form.TextArea
                                required={true}
                                style={{
                                    maxHeight: '30px',
                                    maxWidth: '96%',
                                    marginBottom: '10px',
                                }}
                                placeholder="Election Description"
                                value={this.state.election_description}
                                onChange={event => this.setState({ election_description: event.target.value })}
                            />

                            <Button
                                color="blue"
                                fluid
                                size="large"
                                style={{ marginBottom: 15 }}
                                type="submit"
                                loading={this.state.loading}
                                disabled={this.state.loading || !this.state.election_name || !this.state.election_description}
                            >
								Submit
							</Button>
                            {this.state.errorMess && (
                                <Message negative>
                                    <Message.Header>Unable to create election</Message.Header>
                                    <p>{this.state.errorMess}</p>
                                </Message>
                            )}
							<Message icon info>
								<Icon name="exclamation circle" />
								<Message.Header>Note: </Message.Header>
								<Message.Content>Election creation will take several minutes.</Message.Content>
							</Message>
						</Segment>
					</Form>
				</Grid.Column>
			</Grid>
		</div>
	);

	render() {
		return (
			<div>
				<link rel="stylesheet" href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css" />
				{/* <link href="../css/paper-dashboard.css?v=2.0.0" rel="stylesheet" /> */}
				{this.LoginForm()}
			</div>
		);
	}
}

export default LoginForm;
