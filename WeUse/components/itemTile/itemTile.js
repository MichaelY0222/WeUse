Component({
  properties: {
    index:{
      type:Number,
      value:-1
    },
    
    name: {
      type:String,
      value:"NAME"
    },

    image: {
      type:String,
      value:"https://th.bing.com/th/id/R.51879f9aeaaf6060aa42a64df71696f1?rik=h8Ox9c2rUwGi%2fg&pid=ImgRaw&r=0"
    },
    quantity: {
      type:Number,
      value:0
    },

    grades: {
      type:String,
      value:"All"
    },

    subject: {
      type: String,
      value: "All"
    },
    
    stamps: {
      type: Number,
      value: 0
    },

    level: {
      type: String,
      value: "All"
    }

  }
})