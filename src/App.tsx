import "./App.css";
import React, { Component } from "react";
import QrReader from "react-qr-reader";
import Peer from "peerjs";
import { Heading, toaster, Paragraph } from "evergreen-ui";
import Box from "ui-box";
import QRCode from "qrcode.react";

import { Desktop, Mobile } from "./DisplayComponents";

interface State {
  peer?: Peer;
  id?: string | undefined;
  peer_id?: string;
  isConnected: boolean;
}

class App extends Component<{}, State> {
  state: State = { peer: new Peer(), isConnected: false };
  connection!: Peer.DataConnection;

  componentDidMount() {
    this.state.peer?.on("open", (id) => {
      console.log(id);
      this.setState({ id });
    });

    this.state.peer?.on("connection", (connection) => {
      console.log('connection made')
      this.connection = connection; // does this need to be in state??

      this.setUpConnectionListeners()
    });

    this.state.peer?.on("error", this.reportError);

    this.state.peer?.on("disconnected", () => {
      // set initalized
      this.state.peer?.reconnect();
      this.reportError();
    });
  }

  onReceiveData = (data: any) => {};

  reportError = (err?: any) => {
    if (err) {
      console.log(err);
    }
    toaster.danger("An Error occured.");
  };

  onScan = (result: string | null) => {
    //only once???
  if (result && typeof result === 'string') {
    console.log(result);
    this.connection = this?.state?.peer?.connect(result);
    this.setUpConnectionListeners();
  //   successfully connecet toaster
  } 
};

setUpConnectionListeners = () => {
  this.connection.on("open", () => {
    this.setState({ isConnected: true });
  });

  this.connection.on("data", this.onReceiveData);

  this.connection.on("error", this.reportError);
}

  onError = (err: any) => {
    console.log(err);
    toaster.danger("There was a problem scanning the QRcode");
  };

  // getView = () => {
  //   if (this?.state?.id) {
  //     re 
  //   }
  // }

  componentWillUnmount() {
    this.state.peer?.destroy();
  }

  render() {
    return (
      <Box position="relative" height="100%" width="100%">
        <Box
          position="absolute"
          top="50%"
          left="50%"
          color="#47B881"
          transform="translate(-50%, -50%)"
          textAlign="center"
        >
          <Heading size={600} fontWeight="bold" color="#47B881">File Drop</Heading>

          <Paragraph marginTop="1rem" marginBottom="1rem" color="muted">
            Transfer images from your phone to your computer
          </Paragraph>

          {this?.state?.id && !this?.state.isConnected ? (
            <Box>
              <Desktop>
                <QRCode value={this?.state?.id} />
                <Heading marginTop="8px">Here is your ID:</Heading>
                <Paragraph color="muted" marginTop="8px" marginBottom="8px">
                  {this?.state?.id}
                </Paragraph>
              </Desktop>

              <Mobile>
              <QrReader onScan={this.onScan} onError={this.onError}></QrReader>
                <Heading marginTop="8px">Here is your ID:</Heading>
                <Paragraph fontWeight="bold" color="#47B881" marginTop="8px" marginBottom="8px">
                  {this?.state?.id}
                </Paragraph>
              </Mobile>
            </Box>
          ) : (
            <Paragraph marginTop="1rem" color="muted">
              Loading...
            </Paragraph>
          )}
        </Box>
      </Box>
    );
  }
}

export default App;
