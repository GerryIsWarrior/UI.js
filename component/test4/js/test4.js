/**
 * Created by gerry.zhong on 2017/2/5.
 */
use(function(data,that){
    /*
     * 该对象承载所有需要抛出去的对象
     *   1.该对象中的方法可以自己写
     *   2.该对象中的方法可以注入（例子中的tempObj.tool.AA）
     *   3.该对象也可以选择性抛出给使用者需要的方法，也可以隐藏（tool.BBBB）
     * */
    var tempObj ={
        //reader为一些初始化需要的操作，有时候会有注册事件等，或者一些预操作
        reader:function(){
            that = this;
        },
        //注入所有的选择器，方便选择器变化，直接修改该对象中的选择器，而不需要全局去更改
        selector:{
            testBtn:"#testBtn",  //按钮
        },
        //注入page中所有的事件，统一管理，建议命名规范：事件_命名，例 click_login
        registerEle:{
            click_testBtn:function(){
                //注册单击事件
                document.querySelectorAll(that.selector.testBtn)[0].onclick = function(){
                    that.firm.testLoad();
                }
            }
        },
        //注入所有ajax请求，页面所有请求，将在这里统一管理，建议命名规范：ajax_命名，例 ajax_login
        /*
         * 该请求中有2种方案,看需求使用
         *  1.不公用一个请求方案
         *  2.公用一个请求，但是回调处理不一样
         * */
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
                alert("获取接口的值："+data.interface)
            }
        }
    };
    ui.component.reader(tempObj);
});

