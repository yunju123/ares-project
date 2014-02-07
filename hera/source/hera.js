/*global enyo, ares, Ares */

enyo.kind({
	name: "Ares.Hera",
	kind: "Control",
	published: {
		red: '00',
		blue: '00',
		green: '00',
		color: "000000",
		x: "0",
		y: "0",
		z: "0",
		misc: "",
		toggle: "",
		file_source_dir: ""
	},
	events: {
		onRegisterMe: "",
		onNewcss: "",			// insert at end of file
		onReplacecss: "",		// replace it in ace
		onEditcss: ""			// call to reload the css editor and data
	},	
	handlers: {
		onPickdeclaration: "radioActivated",
		onValueUpdate: "change",
		onUnitChange: "unitchange",
	},
	components: [
		{kind: "enyo.FittableColumns", style: "width: 33%; height: 100%;", components:[
			
			{name: "cssleft", kind: "Ares.Hera.Leftpannel", style: "width: 100%; height: 100%; ",	classes:"ares_deimos_left"},	// left
			
			{name: "center", kind: "enyo.FittableRows", style: "width: 100%; height: 100%; ", components: [
				
				{name:"sampleBox", kind: "enyo.FittableColumns",	style: "width: 100%; height: 60%; ", classes: "hera_builder_font", allowHtml: true, Xstyle: "padding: 10px;", components: [
					{name: "Sample", allowHtml: true, style: "height: 60%; font-size: 10px;", components: [
						{name: "sampletext", content: "Sample Text"},
					]}
				]},					
				
				{name:"outputBox", kind: "enyo.FittableColumns",	style: "width: 100%; height: 40%; ", classes: "hera_builder_font", allowHtml: true, Xstyle: "padding: 10px;", components: [
					{name: "bg", allowHtml: true, style: "font-size: 13px;", content: ""},
				]},	
			]},// center
			
			{kind: "FittableRows", style: "width: 100%; height: 100%;", components: [
				{kind: "enyo.FittableColumns",  style: "width: 100%; height: 60%;", classes: "enyo-unselectable", components: [
					{name: "list", kind: "List", count: 100, multiSelect: false, classes: "list-sample-list", onSetupItem: "setupItem", components: [
						{name: "item", style: "width: 100%;", classes: "list-sample-item enyo-border-box", ontap: "classGrabber", components: [
							{name: "name2", style: "width: 100%;"}
						]},				
					]},
				]},

				{kind: "enyo.FittableColumns", style: "width: 100%; height: 40%;", fit: true, classes: "enyo-unselectable", components: [
					{name: "valueinput", kind: "Ares.Hera.ValueInput", onUpdate: "change"},
					
				]}
			]},	// right
		]}, 
	
		{kind: "onyx.Popup", modal: true, floating: true, centered: true, canGenerate: false, name: "newCssPopup", components: [
			{kind: "onyx.Toolbar", layoutKind: "FittableColumnsLayout", name: "toolbar4", components: [
				{name: "newCssName", kind: "Control", content: "Enter you new class name" }
			]},
			{kind: "onyx.Input", placeholder: "Enter your class name!..", name: "input"},
			{kind: "onyx.Button", classes: "ok", content: "Ok", ontap:"newDeclaration"}
		]}
	],
	
	declaration: [],
	properties: [],			
	value: [],

	create: function() {
		this.inherited(arguments);
		ares.setupTraceLogger(this);	
		this.$.outputBox.applyStyle("color", "#FFFFFF");
		this.$.outputBox.applyStyle("background-color", "#000000");
		this.trace("Just created a new", this.name, "object", this);
		this.unit = "px";
	},	
	
	/*
	* load the data this is were the fun start's
	*/
	cssload: function(data){
		this.trace("data", data);
		this.filesourcedir = data.originator.docData.attributes.file.path;
		var d = data.originator.$.aceWrapper.value;
		this.dePuzzle(d);
	},
	
	/*
	* save -- dose a find and replce in  phobos for the ace editor
	* @protected
	*/
	csssave: function(inSender, inEvent){
		this.trace("sender:", inSender, ", event:", inEvent);
		if(this.mode === "reset"){
			return;
		}
		if(this.mode === "new"){
			this.doNewcss();
			this.reset();
		}
		if(this.mode === "editing"){
			this.doReplacecss();
		}
		return true;
	},
	
	/*
	* this is were we come in (new values)  from valueinput.js 
	* @protected
	*/
	change: function(inSender, inEvent){
		this.trace("sender:", inSender, ", event:", inEvent);
		var a = 0;
		this.newvalue = inEvent.originator.valueout;
		
		if(this.newvalue.indexOf("url") != -1){
			this.fixurl(this.newvalue);
		}
		
		
		while(this.properties[a] !== undefined && this.properties[a] !== "null"){
			if(this.properties[a].indexOf(this.$.property) !== -1 ){
				break;	
			}
			a++;
		}
		this.properties[a] = "\t" + this.$.property;
		this.value[a] = this.newvalue;
		this.updateBox();
	},

	/*
	* this is were we push out to the output sample box and build the output to copy in to ace
	* @protected
	*/
	updateBox: function(inSender, inEvent){
		this.trace("sender:", inSender, ", event:", inEvent);
		var a = 0;
		var tab = "&nbsp;&nbsp;&nbsp;&nbsp;";
		var outPut = this.className + " " + "{<br>" ;
		var outString =  this.className + " " + "{\n" ;
	
		while(this.properties[a] !== undefined && this.properties[a] !== "null"){
			if(this.properties[a] === "font-family"){
				this.properties[a] =  "\t" + this.properties[a];
			}
			outPut = outPut + tab + this.properties[a] + ":" + this.value[a] + "<br>";
			outString = outString + this.properties[a] + ":" + this.value[a] + "\n";
			this.$.Sample.applyStyle(this.properties[a], this.value[a]);
			this.$.sampletext.applyStyle(this.properties[a], this.value[a]);
			a++;
		}		
		this.$.bg.setContent(outPut + "}");		// write in to the preview box
		this.out = outString + "}\n";
	},

	/*
	* this is were we set wich input group to display in valueinput.js
	* @protected
	*/
	radioActivated: function(inSender, inEvent) {
		this.trace("sender:", inSender, ", event:", inEvent);
		var a = 0;
	
		this.$.property = inEvent.name;
		
		if (inEvent.input === "font"){
			this.$.valueinput.showsblank();
			this.$.property = "font-family";
			
			while(this.properties[a] !== undefined && this.properties[a] !== "null"){
				if(this.properties[a].indexOf(this.$.property) !== -1 ){
					break;	
				}
				a++;
			}
			this.properties[a] = this.$.property;
			this.value[a] = " " + inEvent.name +  ";";
			this.updateBox();		
		}
		
		this.$.valueinput.inputtype(inEvent.input);

		this.updateBox();
	},

	/*
	* this is were we get the "new CSS declarations name "  from the popup
	* @protected
	*/
	newDeclaration: function(inSender, inEvent){	
		this.trace("sender:", inSender, ", event:", inEvent);
		this.className = this.$.input.hasNode().value;
		this.$.newCssPopup.hide();
		this.mode ="new";
		this.updateBox();
		return;
	},

	/*
	* handle the unit change if the programer change's it
	* @protected
	*/
	unitchange: function(inSender, inEvent){
		this.trace("sender:", inSender, ", event:", inEvent);
		this.unit = inEvent.content;
		this.change();
	},
	
	reset: function(){
		this.$.valueinput.showsblank();
		this.properties.length = 0;			
		this.value.length = 0;	
		this.old = null;
		this.className = null;	
		this.outPut = null;	
			
		this.$.bgImage = null;
		this.x = null;
		this.y = null;
		this.z = null;	
		
		this.$.outPut = null;
		this.$.property = null;	
		this.mode = "rest";
		this.$.outputBox.applyStyle("color", "#FFFFFF");
		this.$.outputBox.applyStyle("background-color", "#000000");
		this.$.bg.setContent("");	
		this.updateBox();

	},

	/*
	* split up the incoming file to find the declarations for the list in uppper right
	* @protected
	*/
	dePuzzle: function(inSender,inEvent){
		this.trace("sender:", inSender, ", event:", inEvent);
		var j = 0;
		var n =[];
		this.file = inSender;
		var line = inSender.split("\n");
		for (var i=0; i < line.length; i++) {
			if ("." === line[i].charAt(0) || "#" === line[i].charAt(0) ){
				n = line[i].split("{");				
				this.declaration[j] = n[0];
	
				j++;
			//	k = 0;
				n = "";
			}
		}
		this.$.list.setCount(j);
		this.addNewItem();
		this.$.list.reset();
	},

	/*
	* split up the incoming file and find the propert and it's value
	* @protected
	*/
	classGrabber: function(inSender, inEvent){
		this.trace("sender:", inSender, ", event:", inEvent);
		var a = 0;
		var s = "";
		var c = inEvent.index;
		var r = "";
		var n = [];
		this.csssave();
		this.reset();
		n = (this.file.split("\n"));			// split the file up by lines

		if ( this.declaration[c] === "New"){		// check to see if were making a new declartion	
			this.mode = "new";
			this.$.newCssPopup.show();
			this.updateBox();
		}else{
			this.mode = "editing";
			for (var i=0; i < n.length; i++) {
				r = n[i].split("{");
				if(this.declaration[c] === r[0]){
					this.className = this.declaration[c];
					for(var j = i+1;  j < n.length; j++){
					
						s = n[j].split(":");
						if(s[0].indexOf("}") === 0){
							break;
						}
						this.properties[a] = s[0];
						this.value[a] = s[1];						
						a++;
					}
					this.oldcss(this.className);
					this.updateBox();
				}
			}
		}
	},

	/*
	*  hang on to the old info so we know what too replace
	*/	
	oldcss: function (inSender,inEvent){
		this.trace("sender:", inSender, ", event:", inEvent);
		var n = "";
		var j = 0;
		var old = "";
		
		n = (this.file.split("\n"));
		for( j = 0;  j < n.length; j++){
			if(n[j].indexOf(inSender) === 0 ){
				old = old + n[j] + "\n";
				for (var i = j + 1; i < n.length; i++) {
					old = old + n[i] + "\n";
					if(n[i].indexOf("}")=== 0 ){
						this.old = old;
						return;
					}
				}
			}
		}
		
		return;
	},

	/*
	* build the list for right CSS declarations
	*/
	setupItem: function(inSender, inEvent) {
		this.trace("sender:", inSender, ", event:", inEvent);
		var i = inEvent.index;
		var n = this.declaration[i];
		this.$.item.addRemoveClass("list-sample-selected", inSender.isSelected(i));
		this.$.name2.setContent(n);
		return true;
	},
	
	/*
	* add  the "New declarations" to the list
	*/
	addNewItem: function( inSender, inEvent ) {
		this.trace("sender:", inSender, ", event:", inEvent);
        var index = this.$.list.getCount();
        this.$.list.setCount( index+1 );
        this.declaration[index] = "New";
        this.$.list.reset();
    },
  
   /*
   * fix the in coming url to package 
   */
	fixurl: function(address){
		this.log("address:", address);
		var project = Ares.Workspace.projects.active;
		var urlin = address.split("/");
		var currntfileurl = this.filesourcedir;
		var a = currntfileurl.split("/");
		var add = "";
		var b = "";
	
		for (var i=1; i < a.length; i++) {		//  work our way back to the project root from the css file
			if(a[i] === project){
				i++;
				for(i; i < a.length; i++){
					add = add + ".";
				}
				add = add ;
			}
		}
		

		for (var j = 0; j < urlin.length; j++){		// work our way out from root to the image file
			if(urlin[j] === "url("){
				j++;
				for(j;  j < urlin.length; j++){
					b = b + "/" + urlin[j];
				}
			
			}
		}

		var urlout = "url(" + add + b + ");";
		this.newvalue = urlout;
		return;
    }

});
