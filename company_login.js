import React, { Component } from "react";
import {
  Button,
  Divider,
  Transition,
  Form,
  Grid,
  Segment
} from "semantic-ui-react";
import { Router } from "../routes";
import web3 from "../Ethereum/web3";
import Election_Factory from "../Ethereum/election_factory";
import Cookies from "js-cookie";
import { Helmet } from "react-helmet";

class CompanyLogin extends Component {
  state = { visible: true, email: "" };

  toggleVisibility = () => this.setState({ visible: !this.state.visible });

  returnBackImage = () => (
    <div className="login-form">
      <style jsx>{`
        .login-form {
          width: 100vw;
          height: 100vh;
          position: absolute;
          background: url("../../static/blockchain.jpg") no-repeat center center;
          background-size: cover;
          z-index: -1;
        }
      `}</style>
    </div>
  );

  signup = async () => {
    const email = document.getElementById("signup_email").value;
    const password = document.getElementById("signup_password").value;
    const repeat_password = document.getElementById("signup_repeat_password").value;

    if (password !== repeat_password) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/company/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const responseObj = await res.json();
      if (res.ok && responseObj.status === "success") {
        Cookies.set("company_email", encodeURI(email));
        this.setState({ visible: false }); // switch to sign-in view
      } else {
        alert(responseObj.message || "Signup failed");
      }
    } catch (e) {
      alert("Network error: " + e.message);
    }
  };

  signin = async () => {
    const email = document.getElementById("signin_email").value;
    const password = document.getElementById("signin_password").value;
    this.setState({ email });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}/api/company/authenticate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const responseObj = await res.json();
      if (res.ok && responseObj.status === "success") {
        Cookies.set("company_id", encodeURI(responseObj.data.id));
        Cookies.set("company_email", encodeURI(responseObj.data.email));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("company_email", responseObj.data.email);
          } catch (e) {}
        }
      } else {
        alert(responseObj.message || "Signin failed");
        return;
      }
    } catch (e) {
      alert("Network error: " + e.message);
      return;
    }

    // Web3 election flow
    try {
      const accounts = await web3.eth.getAccounts();
      const summary = await Election_Factory.methods
        .getDeployedElection(this.state.email)
        .call({ from: accounts[0] });

      if (summary[2] === "Create an election.") {
        Router.pushRoute(`/election/create_election`);
      } else {
        Cookies.set("address", summary[0]);
        Router.pushRoute(`/election/${summary[0]}/company_dashboard`);
      }
    } catch (err) {
      Router.pushRoute(`/election/create_election`);
    }
  };

  render() {
    const { visible } = this.state;
    return (
      <div>
        <link
          rel="stylesheet"
          href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
        />
        <Helmet>
          <title>Company Login</title>
        </Helmet>
        {this.returnBackImage()}

        <Button.Group style={{ marginLeft: "43%", marginTop: "5%" }}>
          <Button
            primary
            content={visible ? "Sign in" : "Sign Up"}
            onClick={this.toggleVisibility}
          />
        </Button.Group>

        <Divider style={{ zIndex: "-10" }} />

        <Grid className="grid1">
          <Grid.Row>
            <Grid.Column
              width={5}
              style={{ marginLeft: "33%", marginTop: "5%" }}
              verticalAlign="middle"
            >
              <Segment placeholder className="segment">
                <Transition visible={!visible} animation="scale" duration={300}>
                  <Form size="large">
                    <h3 style={{ textAlign: "center" }}>Sign in</h3>
                    <Form.Input
                      fluid
                      id="signin_email"
                      icon="user"
                      iconPosition="left"
                      placeholder="Email"
                      style={{ padding: 5 }}
                    />
                    <Form.Input
                      style={{ padding: 5 }}
                      fluid
                      id="signin_password"
                      icon="lock"
                      iconPosition="left"
                      placeholder="Password"
                      type="password"
                    />
                    <Button
                      onClick={this.signin}
                      color="blue"
                      fluid
                      size="large"
                      style={{ marginBottom: 15 }}
                    >
                      Submit
                    </Button>
                  </Form>
                </Transition>

                <Transition visible={visible} animation="scale" duration={300}>
                  <Form size="large">
                    <h3 style={{ textAlign: "center" }}>Sign up</h3>
                    <Form.Input
                      fluid
                      id="signup_email"
                      icon="user"
                      iconPosition="left"
                      placeholder="Email"
                      style={{ padding: 5 }}
                    />
                    <Form.Input
                      style={{ padding: 5 }}
                      fluid
                      id="signup_password"
                      icon="lock"
                      iconPosition="left"
                      placeholder="Password"
                      type="password"
                    />
                    <Form.Input
                      style={{ padding: 5 }}
                      fluid
                      id="signup_repeat_password"
                      icon="lock"
                      iconPosition="left"
                      placeholder="Repeat Password"
                      type="password"
                    />
                    <Button
                      onClick={this.signup}
                      color="blue"
                      fluid
                      size="large"
                      style={{ marginBottom: 15 }}
                    >
                      Submit
                    </Button>
                  </Form>
                </Transition>
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default CompanyLogin;
