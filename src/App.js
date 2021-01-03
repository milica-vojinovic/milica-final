import React from "react";
import "./style/App.scss";
import { StoreService } from "./services/store.service";

const Regex = RegExp(/[^A-Za-z0-9 ]+/g);

export default class App extends React.Component {
  constructor(props) {
    StoreService.initialize();
    super(props);
    let userData = StoreService.getStoreProperty("user");
    this.state = {
      Home: userData && userData.Home ? userData.Home : {},
      selected: userData && userData.selected ? userData.selected : "Home",
      showNewWindow:
        userData && userData.showNewWindow ? userData.showNewWindow : false,
      showFileUpload:
        userData && userData.showFileUpload ? userData.showFileUpload : false,
      showContent: "",
      update: true,
    };
  }

  currentPath = () => {
    let selected = this.state.selected;
    let newFolder = Object.keys(this.state.Home).filter(
      (folderName) => this.state.Home[folderName].parentDirectory === selected
    );
    return newFolder;
  };

  handleNewFolderClick = (e) => {
    e.preventDefault();
    this.setState({
      showNewWindow: true,
    });
    let cachedUserData = this.state;
    StoreService.updateStoreProperty("user", cachedUserData);
  };

  handleFileUploadClick = (e) => {
    e.preventDefault();
    this.setState({
      showFileUpload: true,
    });
    let cachedUserData = this.state;
    StoreService.updateStoreProperty("user", cachedUserData);
  };

  handleNewFolderSubmit = (e) => {
    e.preventDefault();
    const name = this.input.value;
    if (!!Regex.test(name)) {
      alert("Name can only contain letters, numbers and spaces");
      return;
    }

    const key = name.replace(" ", "_");
    let selected = this.state.selected;
    let statusCopy = Object.assign({}, this.state);
    statusCopy.Home[key] = {
      name: name,
      type: "folder",
      date: new Date().toISOString().split("T")[0],
      ip: 749874273,
      parentDirectory: selected,
    };
    statusCopy.showNewWindow = false;
    this.setState(statusCopy);
    StoreService.updateStoreProperty("user", statusCopy);
  };

  handleFileUploadSubmit = (e) => {
    e.preventDefault();
    const name = this.input.value;
    if (!!Regex.test(name)) {
      alert("Name can only contain letters, numbers and spaces");
      return;
    }
    const key = name.replace(" ", "_");
    const format = this.format.value;
    let selected = this.state.selected;
    let statusCopy = Object.assign({}, this.state);
    statusCopy.Home[key] = {
      name: name,
      type: format,
      date: new Date().toISOString().split("T")[0],
      ip: 749874273,
      parentDirectory: selected,
    };
    statusCopy.showFileUpload = false;
    this.setState(statusCopy);
    StoreService.updateStoreProperty("user", statusCopy);
  };

  handleFolderDoubleClick = (e) => {
    e.preventDefault();
    let selected = e.target.id;
    if (selected === "Home" || this.state.Home[selected].type === "folder") {
      let statusCopy = Object.assign({}, this.state);
      statusCopy.selected = selected;
      this.setState(statusCopy);
      StoreService.updateStoreProperty("user", statusCopy);
    } else {
      return;
    }
  };

  handleBackClick = (e) => {
    e.preventDefault();
    let selected = this.state.selected;
    if (selected === "Home") {
      return;
    } else if (this.state.Home[selected].parentDirectory === "Home") {
      let statusCopy = Object.assign({}, this.state);
      statusCopy.selected = "Home";
      this.setState(statusCopy);
      StoreService.updateStoreProperty("user", statusCopy);
    } else {
      let newFolder = Object.keys(this.state.Home).find(
        (folderName) => folderName === this.state.Home[selected].parentDirectory
      );
      let statusCopy = Object.assign({}, this.state);
      statusCopy.selected = newFolder;
      this.setState(statusCopy);
      StoreService.updateStoreProperty("user", statusCopy);
    }
  };

  handleRename = (e) => {
    e.preventDefault();
    let selected = e.target.getAttribute("data-key");
    let newName = prompt("Please enter new name");
    if (!newName) {
      return;
    }
    if (!!Regex.test(newName)) {
      alert("Name can only contain letters, numbers and spaces");
      return;
    }
    let statusCopy = Object.assign({}, this.state);
    statusCopy.Home[selected].name = newName;
    this.setState(statusCopy);
    StoreService.updateStoreProperty("user", statusCopy);
  };

  handleMove = (e) => {
    e.preventDefault();
    let selected = e.target.getAttribute("data-key");
    let promptParent = prompt("Please enter destination folder's Name");
    let enteredParent = promptParent.replace(" ", "_");
    if (
      Object.keys(this.state.Home).includes(enteredParent) ||
      enteredParent === "Home"
    ) {
      let statusCopy = Object.assign({}, this.state);
      statusCopy.Home[selected].parentDirectory = enteredParent;
      this.setState(statusCopy);
      StoreService.updateStoreProperty("user", statusCopy);
    } else {
      alert("Folder does not exist");
    }
  };

  handleKeyDelete = (parent) => {
    let children = Object.keys(this.state.Home).filter(
      (folderName) => parent === this.state.Home[folderName].parentDirectory
    );
    if (children.length === 0) {
      let statusCopy = Object.assign({}, this.state);
      delete statusCopy.Home[parent];
      this.setState(statusCopy);
      StoreService.updateStoreProperty("user", statusCopy);
    } else {
      for (const j of children) {
        this.handleKeyDelete(j);
      }
    }
  };

  handleDelete = (e) => {
    e.preventDefault();
    let selected = e.target.getAttribute("data-key");
    this.handleKeyDelete(selected);
  };

  handleFolderClick = (e) => {
    let selected = e.target.id;
    if (this.state.Home[selected].type !== "folder") {
      return;
    }
    if (this.state.showContent === selected) {
      this.setState({
        showContent: "",
      });
    } else {
      this.setState({
        showContent: selected,
      });
    }
  };

  returnContents = (key) => {
    return [
      <div className="new-line">
        <div className="header-name new-header-name">
          {this.state.Home[key].type === "folder" ? (
            <i className="fa fa-folder"></i>
          ) : (
            <i className="fa fa-file"></i>
          )}
          <span id={key} onDoubleClick={this.handleFolderDoubleClick}>
            {this.state.Home[key].name}
          </span>
        </div>
        <div className="header-type">{this.state.Home[key].type}</div>
        <div className="header-date">{this.state.Home[key].date}</div>
        <div className="header-actions">
          <div data-key={key} className="option" onClick={this.handleRename}>
            Rename
          </div>
          <div data-key={key} className="option" onClick={this.handleMove}>
            Move
          </div>
          <div data-key={key} className="option" onClick={this.handleDelete}>
            Delete
          </div>
        </div>
      </div>,
    ];
  };

  getLocation = (folder, directory) => {
    let parent = this.state.Home[folder].parentDirectory;
    directory.unshift(parent);
    if (parent === "Home") {
      return;
    } else {
      this.getLocation(parent, directory);
    }
  };

  returnLocation = (folder) => {
    let directory = [];
    if (folder !== "Home") {
      this.getLocation(folder, directory);
    }
    directory.push(folder);
    console.log("return Location", directory);
    return (
      <div>
        {directory.map((element) => (
          <span
            id={element}
            className="folder-span"
            onClick={this.handleFolderDoubleClick}
          >
            {" "}
            / {element}{" "}
          </span>
        ))}
      </div>
    );
  };

  render() {
    let path = this.currentPath();
    const { showContent } = this.state;

    return (
      <div className="App">
        <div className="header">
          <div className="header">
            <div className="header-top">
              <div className="header-left">
                <i
                  className="fa fa-chevron-left"
                  onClick={this.handleBackClick}
                ></i>
                <div className="location">
                  {this.returnLocation(this.state.selected)}
                </div>
              </div>
              <div className="header-options">
                <div
                  className="new-folder new-click"
                  onClick={this.handleNewFolderClick}
                >
                  <i className="fa fa-folder-open"></i>New Folder
                </div>
                <div
                  className="file-upload new-click"
                  onClick={this.handleFileUploadClick}
                >
                  <i className="fa fa-upload"></i>File Upload
                </div>
              </div>
            </div>

            <div className="new-line header-bottom">
              <div className="header-name">Name</div>
              <div className="header-type">Type</div>
              <div className="header-date">Date Created</div>
              <div className="header-actions">Options</div>
            </div>
          </div>
        </div>

        {path.map((key) => {
          return (
            <div>
              <div className="new-line">
                <div className="header-name">
                  {this.state.Home[key].type === "folder" ? (
                    <i className="fa fa-folder"></i>
                  ) : (
                    <i className="fa fa-file"></i>
                  )}
                  <span
                    id={key}
                    onClick={this.handleFolderClick}
                    onDoubleClick={this.handleFolderDoubleClick}
                  >
                    {this.state.Home[key].name}
                  </span>
                </div>
                <div className="header-type">{this.state.Home[key].type}</div>
                <div className="header-date">{this.state.Home[key].date}</div>
                <div className="header-actions">
                  <div
                    data-key={key}
                    className="option"
                    onClick={this.handleRename}
                  >
                    Rename
                  </div>
                  <div
                    data-key={key}
                    className="option"
                    onClick={this.handleMove}
                  >
                    Move
                  </div>
                  <div
                    data-key={key}
                    className="option"
                    onClick={this.handleDelete}
                  >
                    Delete
                  </div>
                </div>
              </div>
              {this.state.showContent === key
                ? Object.keys(this.state.Home)
                    .filter(
                      (folderName) =>
                        this.state.Home[folderName].parentDirectory ===
                        showContent
                    )
                    .map((key) => this.returnContents(key))
                : null}
            </div>
          );
        })}

        {this.state.showNewWindow ? (
          <div id="createNewFolder" className="popup-holder">
            <div className="popup">
              <div className="popup-content">
                <div className="title">Enter Folder Name: </div>
                <form onSubmit={this.handleNewFolderSubmit} noValidate>
                  <input
                    id="new-folder"
                    ref={(element) => {
                      this.input = element;
                    }}
                    name="new-folder"
                    placeholder="New Folder"
                    type="text"
                    className="input"
                  />
                  <button
                    className="button"
                    type="submit"
                    name="submit"
                    classes="button"
                    value="Save"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}

        {this.state.showFileUpload ? (
          <div id="fileUpload" className="popup-holder">
            <div className="popup">
              <div className="popup-content">
                <div className="title">Enter File Name: </div>
                <form onSubmit={this.handleFileUploadSubmit} noValidate>
                  <input
                    id="file-upload"
                    ref={(element) => {
                      this.input = element;
                    }}
                    name="new-file"
                    placeholder="File Name"
                    type="text"
                    className="input"
                  />
                  <select
                    id="file-upload"
                    ref={(element) => {
                      this.format = element;
                    }}
                    name="new-file"
                    className="input"
                  >
                    <option value="pdf">pdf</option>
                    <option value="txt">txt</option>
                    <option value="jpg">jpg</option>
                    <option value="png">png</option>
                    <option value="docx">docx</option>
                  </select>
                  <button
                    className="button"
                    type="submit"
                    name="submit"
                    classes="button"
                    value="Save"
                  >
                    Save
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
