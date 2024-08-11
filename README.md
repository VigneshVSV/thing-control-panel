# Thing Control Panel

Admin control panel in React for "Things" implemented with [`hololinked`](https://github.com/VigneshVSV/hololinked) or 
having a standard WoT Thing Description with HTTP protocol binding. Suitable for development of server backend, 
test properties, actions and events or generic use purposes to interact with the Thing. 

The GUI is only coming up, its still rough on the edges. 

### Installation

```npm install . ``` or ```npm install . --force``` to install the requirements and dependencies <br/>
```npm run dev``` to run as react app <br/>
```npm run dev -- --host --port 12345``` to run on the network <br/>
```npm run build``` to build and host with your own HTTP server <br/>

### Usage

Insert the address of the device, then press load. If you are using your own Thing server runtime or a standard location to store
your thing descriptions, click on settings (cog-wheel on top left) and edit "default endpoint for fetching thing description" to suit
your requirements. If you are using `hololinked` as the server, the default endpoint must `/resources/portal-app`, and enter the 
Thing addresss as https://{address of host}/{instance name of the thing}.

If self signed HTTP(s) certificate is used, you might have to give permission to the browser. Its suggested to use Mozilla as Chrome seems
to have issues with self-signed certificates since version 119. 

After you load, your defined properties, actions and events are shown. You can freely interact with them as shown below:

![Read-Write-Observe Properties](readme-assets/properties.png)
![Execute Actions](readme-assets/actions.png)
![Stream Events](readme-assets/events.png)

Its recommended to install a JSON viewer for your web browser, like [this](https://chromewebstore.google.com/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh).

You can then load the console entries in a new tab and read it in a correctly formatted way. Edit the number of entries that can stored in the console output
by setting the value of "Max Entries" from the drop down. More entries will take more RAM, but useful for capturing events or eventful measurement data directly 
in the GUI. 

##### Contributors welcome. There are also similar projects available from Web of Things community. 

### To Do

- Log Viewer does not work correctly, although its almost complete. 
- Improvements in viewing TD, especially for events as its shown right below 
- Settings are not saved correctly in browser
- Responsive layout for smaller screens
- Packaging in Electron

Possible further ideas
- Database viewer (i.e. viewer of properties that are stored in database)
- Observe all properties, subscribe all events
- Graphical data acquisition into file using events


