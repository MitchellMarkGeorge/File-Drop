import "./App.css";
import React, { Component } from "react";
import QrReader from "react-qr-reader";
import Peer from "peerjs";
import {
  Heading,
  toaster,
  Paragraph,
  FilePicker,
  TextInput,
  Link,
} from "evergreen-ui";
import Box from "ui-box";
import QRCode from "qrcode.react";

import { Desktop, Mobile } from "./DisplayComponents";

interface State {
  peer?: Peer;
  id?: string | undefined;
  peer_id?: string;
  connection: Peer.DataConnection;
  isConnected: boolean;
  files?: TransferedFiles[];
}

interface Data {
  file: ArrayBuffer;
  name: string;
  type: string;
}

interface TransferedFiles {
  url: string;
  name: string;
}

class App extends Component<{}, State> {
  state: State = {
    peer: new Peer(),
    isConnected: false,
    peer_id: "",
    connection: null,
    files: [],
  };
  connection!: Peer.DataConnection;

  componentDidMount() {
    this.state.peer?.on("open", (id) => {
      console.log(id);
      this.setState({ id });
    });

    this.state.peer?.on("connection", (connection) => {
      console.log("connection made");
      // this.connection = connection; // does this need to be in state??
      this.setState({ connection }, this.setUpConnectionListeners);
      // this.setUpConnectionListeners();
    });

    this.state.peer?.on("error", this.reportError);

    this.state.peer?.on("disconnected", () => {
    
      this.setState({ connection: null})
      this.state.peer?.reconnect();
      this.reportError();
    });
  }

  onReceiveData = (data: Data) => {
    toaster.success("New file transdered");
    console.log(data);
    const { file, name, type } = data;
    const blob = new Blob([file], { type });
    const url = URL.createObjectURL(blob);
    const newFileObj: TransferedFiles = { url, name };
    console.log(newFileObj);
    this.setState({ files: [...this.state.files, newFileObj] });
  };

  reportError = (err?: any) => {
    if (err) {
      console.log(err);
    }
    toaster.danger("An Error occured.");
  };

  onScan = (result: string | null) => {
    //only once???
    if (result && typeof result === "string") {
      console.log(result);
      const connection = this?.state?.peer?.connect(result);
      this.setState({ connection }, this.setUpConnectionListeners);
      // this.connection = this?.state?.peer?.connect(result);
      // this.setUpConnectionListeners();
      //   successfully connecet toaster
    }
  };

  setUpConnectionListeners = () => {
    this.state.connection.on("open", () => {
      this.setState({ isConnected: true });
    });

    this.state.connection.on("data", this.onReceiveData);

    this.state.connection.on("error", this.reportError);

    this.state.connection.on("close", () => {
      this.setState({ connection: null });
    });
  };

  onError = (err: any) => {
    console.log(err);
    toaster.danger("There was a problem scanning the QRcode");
  };

  onFilePickerChange = (files: FileList) => {
    // console.log(files.item(1))
    console.log(files);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const { type, name } = file;

      this.state.connection.send({
        file,
        name,
        type,
      });
    }
  };

  onKeyPress = (e: any) => {
    console.log("here");
    if (e.key === "Enter") {
      const connection = this?.state?.peer?.connect(this.state.peer_id);
      console.log(connection);
      this.setState({ connection }, this.setUpConnectionListeners);
      // this.connection = this?.state?.peer?.connect(this.state.peer_id);
      // console.log(this.connection);
      // this.setUpConnectionListeners();
    }
  };

  getView = () => {
    if (this.state.connection) {
      return (
        <>
          <FilePicker
            multiple
            placeholder="Select your file(s)"
            //@ts-ignore
            onChange={this.onFilePickerChange}
          />

          {this?.state?.files?.length > 0 &&
            this?.state?.files?.map((file, index) => (
              <Box key={index} marginTop="1rem">
                <Link allowUnsafeHref href={file.url} download={file.name}>
                  {file.name}
                </Link>
              </Box>
            ))}
        </>
      );
    } else if (this?.state?.id) {
      return (
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
            <Heading marginTop="8px" marginBottom="8px">
              Here is your ID:
            </Heading>
            <Paragraph
              fontWeight="bold"
              color="#47B881"
              marginTop="8px"
              marginBottom="8px"
            >
              {this?.state?.id}
            </Paragraph>
          </Mobile>
        </Box>
      );
    } else {
      return (
        <Paragraph marginTop="1rem" color="muted">
          Loading...
        </Paragraph>
      );
    }
  };

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
          <Heading size={600} fontWeight="bold" color="#47B881">
            File Drop
          </Heading>

          <Paragraph marginTop="1rem" marginBottom="1rem" color="muted">
            Transfer images from your phone to your computer
          </Paragraph>

          {!this.state.connection && (
            <TextInput
              placeholder="Put in peer id"
              marginBottom="1rem"
              value={this.state.peer_id}
              onChange={(e: any) => this.setState({ peer_id: e.target.value })}
              onKeyPress={this.onKeyPress}
            />
          )}

          {this.getView()}

        </Box>
      </Box>
    );
  }
}

export default App;
