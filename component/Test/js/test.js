/**
 * Created by gerry.zhong on 2017/2/5.
 */
use(function(data,that){
    var tempObj ={
        //reader为一些初始化需要的操作，有时候会有注册事件等，或者一些预操作,加载完毕，会首先跑这个方法，这是一个入口
        reader:function(){
            that = this;
            that.firm.testLoad();
        },
        //注入所有的选择器，方便选择器变化，直接修改该对象中的选择器，而不需要全局去更改
        selector:{
            testBtn:"#testBtn",  //按钮
        },
        //注入page中所有的事件，统一管理，建议命名规范：事件_命名，例 click_login
        registerEle:{
        },
        //注入所有ajax请求，页面所有请求，将在这里统一管理，建议命名规范：ajax_命名，例 ajax_login
        ajaxRequest:{
        },
        //处理所有回调函数，针对一个请求，处理一个回调
        callback:{
        },
        //临时缓存存放区域，仅针对本页面，如果跨页面请存放cookie或者localstorage等
        //主要解决有时候会使用页面控件display来缓存当前页面的一些数据
        temp:{
        },
        /*
         * 业务使用区域，针对每个特别的业务去串上面所有的一个个原子
         *   因为上面所有的方法，只是做一件事，这边可以根据业务进行串服务，很简单的
         * */
        firm:{
            testLoad:function(){
                console.log("获取接口的值："+data.interface.interface1)
            }
        }
    };
    ui.component.reader(tempObj);
});

