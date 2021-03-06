ui.config({
    //注入模块
    container:{
        //布局模板名称：模板地址+是否装载(PS:如果都为true只会选择第一个模板容器)
        "layout1":["app/demoPage1.tpl",true],
        "layout2":["app/demoPage2.tpl",false]
    },
    //注入接口
    interface:{
        "interface1":"www.123.com/interface1111111",
        "interface2":"www.123.com/interface2",
        "interface3":"www.123.com/interface3",
        "interface4":"www.123.com/interface4",
        "interface5":"www.123.com/interface555555555555",
    },
    //注入组件
    component:{
        //组件名：组件模板+组件样式+组件脚本+接口注入+组件是否装载   ===>  该处可优化针对本地项目和分布式开发进行优化
        "test":["component/test/tpl/test.tpl","component/test/css/test.css","component/test/js/test.js",["interface1","interface2"],true],
        "test1":["component/test1/tpl/test1.tpl","component/test1/css/test1.css","component/test1/js/test1.js",["interface5","interface2"],true],
        "test2":["component/test2/tpl/test2.tpl","component/test2/css/test2.css","component/test2/js/test2.js",["interface1","interface2"],true],
        "test3":["component/test3/tpl/test3.tpl","component/test3/css/test3.css","component/test3/js/test3.js",["interface1","interface2"],false],
        "test4":["component/test4/tpl/test4.tpl","component/test4/css/test4.css","component/test4/js/test4.js",["interface1","interface2"],false],
        "test5":["component/test5/tpl/test5.tpl","component/test5/css/test5.css","component/test5/js/test5.js",["interface1","interface2"],false]
    },
    //容器组件映射关系   选择的容器名称:{"页面容器":"所加载的组件"}
    con_com:{
        layout1:{
            con1:"test",
            con2:"test1",
            con3:"test2",
            con4:"test3",
            con5:"test4",
            con6:"test5",
        },
        layout2:{
            con1:"test",
            con2:"test",
            con3:"test",
            con4:"test",
            con5:"test",
            con6:"test",
        }
    }
});