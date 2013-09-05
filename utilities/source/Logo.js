enyo.kind({
	name: "Ares.Logo",
	classes: "ares-logo",
	tag:"img", 
	src:"",
	alt:"logo",
	create:function(){
		this.inherited(arguments);
		this.setSource("../ares/assets/images/enyo-logo.png");
	},
	setSource: function(src){
		this.setAttribute("src", src);
	}
});