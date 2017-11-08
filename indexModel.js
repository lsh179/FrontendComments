var IndexModel = MVVM.define({
    name: "IndexModel",
    selectItem:[
        {
            id:1,
            item:'选项一'
        },
        {
            id:2,
            item:'选项二'
        },
        {
            id:3,
            item:'选项三'
        }
    ],

    selectId:"",
    Items1:["111","11122","11133"],
    Items2:[],
    Items3:[{Names:["1","2","3"]},{Names:["21","22","23"]},{Names:["31","32","33"]}],
    DialogHeight:120,
    selectItem:[{item:'选项一'},{item:'选项二'},{item:'选项三'}],
    onSelectChange:function(ele,model){
       // alert("单击");
        console.log("单击");
    },
    onSelectChange2:function(ele,model){
        alert("双击");
    },
    name222:"选项111二",
    name333:"选项111二",
    SelectNames:"",
    AllUsers:[],
    SetUsers:function () {
        var _this = this;
        this.AllUsers = ["张三","里斯","王二","你好"].select(function(cname){
            return MVVM.define({
                Name: cname,
                Value:"",
                PropertyChanged:function (pname,value,oldvalue) {
                    if(pname=="Value")
                    {
                        var selectnames = '';
                        _this.SelectNames = _this.AllUsers.forEach(function (u) {
                          if(u.Value)
                          {
                              selectnames+=","+u.Name;
                          }
                        });
                        _this.SelectNames = selectnames;
                    }
                }
            });
        })
    },
    UName:{
        name222:"111111",
        names:["2222222","333333333","555555"],
        xxxx:[{yyy:"2222222"},{yyy:"333333"},{yyy:"4444444"}],
        n:"",
    },
    UTools:{
        name222:"222",
        value222:"1111",
        onClick:function(ele, model){
            alert(model.name222);

        }
    }

});

MVVM.scan();