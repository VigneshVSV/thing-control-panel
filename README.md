# Dashboard UI

Control panel for thing implemented with [`hololinked`](https://github.com/VigneshVSV/hololinked) python library in ReactJS

### Installation

```npm install . ``` or ```npm install . --force``` to install the requirements and dependencies <br/>
```npm start``` to run as react app <br/>

### Usage

Insert the address of the device (https://{address of host}/{instance name of the thing}), then press load. If self signed
HTTP(s) certificate is used, you might have to give permission to the browser. Its suggested to use Mozilla as Chrome seems
to have issues with self-signed certificates since version 119. 

![Read-Write-Observe Properties](readme-assets/properties.png)
![Execute Actions](readme-assets/actions.png)
![Stream Events](readme-assets/events.png)

### To Do

- Log Viewer does not work, although its almost complete. 
- Improvements in viewing TD, especially for events as its shown right below 
- Responsive layout for smaller screens
- Packaging in Electron
- Database viewer

Contributors welcome. There are also similar projects available from Web of Things community. 
