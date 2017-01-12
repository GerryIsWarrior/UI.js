/**
 * purpose：     ui.js框架设计
 * author：      仲强
 * version:      1.3
 * date:         2016-12-29
 * email:        gerry.zhong@outlook.com
 * update:          --1.1
 *
 */
(function(window,document,relyObj){

    /*
    *   内部使用一些快捷标识符
    *       0. _  代表dom操作
    *       1. $  代表全局注入的工具类
    *       2. $1 代表注入的ajax类库
    *       3. $2 代表模板处理类库
    *       4. $3 代表所有错误处理信息
    *
    *
    * */

    var _ = relyObj.dom,$ = relyObj.tool,$1 = relyObj.ajax,$2 = relyObj.template,$3 =relyObj.errMsg,that={},ui,UI_global;
    ui = UI_global = {
        //对所有参数进行处理
        config:function(configObject){
            //  1. 初始化数据池
            ui.dataPool.initPool();
            if(configObject === undefined){
                throw new Error("请配置");
            };

            //  2. 将配置文件存储到数据池中，做备用
            ui.dataPool.setData_glo("config",configObject);

            //  3. 检查加载页面容器，加载到body中
            $.each(configObject.container,function(value,key){
                if(value[1] === true){
                    ui.container.loadContainer(key,configObject.baseUrl+value[0],function(data){
                        _("body").html(data);
                        ui.dataPool.setData_glo("private",{"pageConName":key});
                        return;
                    });
                }
            });

            //  4. 处理配置容器和组件映射关系




        },
        //容器核心处理库
        container:{
            //加载容器
            loadContainer:function(name,url,success){
                $1.get(url,"",function(data){
                    data = ui.container.bindConRelation('ui-con',data)
                    success(data);
                },function(){
                    throw new Error("请检查页面容器:"+name+"的.路径是否正确！");
                });
            },
            //绑定容器和组件关系
            bindConRelation:function(name,tpl){
                var reg = new RegExp('('+name+'="[0-9a-zA-Z_]+")', "g"),conValue={};
                //取得页面初始化的所有组件信息
                var resultArr = tpl.match(reg);
                $.each(resultArr,function(value){
                    //var initReg = new RegExp(value, "g"),uuid = $.uuid();
                    //tpl = tpl.replace(initReg, value + ' uuid="'+uuid+'"');
                    var uuid = $.uuid();
                    var tempKey = ui.container.dealValue(value);
                    conValue[tempKey] = uuid;
                });
                //将每个容器分配一个uuid，顺便存储对应所加载的组件
                ui.dataPool.setData_glo("pageContainer",conValue);
                return tpl;
            },
            //处理组件的值
            dealValue:function(value){
                return /".+"/.exec(value)[0].replace(/"/g,"");
            }
        },
        //组件核心处理库
        component:{
            //加载组件
            loadContainer:function(name,url,success){
                $1.get(url,"",function(data){
                    //每次加载完成组件，则在数据中转池生成一个该组件的数据
                    success(data);
                },function(e){
                    throw new Error("请检查页面容器:"+name+"的.路径是否正确！");
                });
            }

        },
        /*
        *   数据中转池核心处理库（以对象方式去存储，这样方便快捷的取数据）
        *       数据格式：
        *           1. mapping（name + uuid ）映射，每个name对应一个uuid  注：每加载一个页面容器生成一个uuid，每次加载一个组件，生成一个组件的uuid，尽量，按需创建和使用
        *           2. pool（uuid + data ）映射，每个uuid对应储存一段数据
        *               a. interface,注入接口信息
        *               b. transfer，流转过来的数据
        *           3. pageContainer，存储当前加载的页面中所有的页面容器
        *           4. global_temp，全局存储的临时数据
        *           5. config，存储用户配置的参数
        *           6. private,存储UI.js本身处理过的数据，内部使用   (需要加载的组件)
        *
        * */
        dataPool:{
            //初始化数据池，将数据池都清空
            initPool:function(){
                that["dataCenter"]={
                    mapping:{},                 //数据例子: "module":"ffb71d7f-995b-4898-8e4b-b283a4fe6253"
                    pool:{},                    //数据例子："ffb71d7f-995b-4898-8e4b-b283a4fe6253":{索要存的对象}
                    pageContainer:{},           //数据例子："name":"http://xxxxx.com"
                    global_temp:{},             //数据例子："Test":"123321"      做全局缓存用
                    config:{},                  //数据例子：值为config中的配置参数值
                    private:{}                 //数据例子：内部使用参数，处理ui.js的内部流程
                };
            },
            //检查是否为数据池全局拒绝修改的参数
            checkParam_glo:function(name){
                var data =["interface","config","private"],len = data.length;
                while(len--> 0){
                    if(name === data[len]){
                        throw new Error($3.pool.forbidUpdate(name));
                    }
                }
                return true;
            },
            //检查是否为组件拒绝修改的参数
            checkParam_com:function(name){
                var data =["interface"],len = data.length;
                while(len--> 0){
                    if(name === data[len]){
                        throw new Error($3.pool.comErr(name));
                    }
                }
                return true;
            },
            /*
            *   数据池设置数据池全局的值（该方法为了固定数据池的参数，防止数据错乱）
            *       name            数据池中需要设置的值的对象
            *       value           存储进来的数据
            *       isAdd           是否为数据池参数增加新的对象
            * */
            setData_glo:function(name,value,isNew){
                //参数检查处理,检查是否为数据池禁止修改数据，初始化一些参数
                //this.checkParam_glo(name);
                isNew = $.is.Boolean(isNew) || false;

                var temp = (new Function("name","dataCenter","return dataCenter."+name+";"))(name,that.dataCenter);
                if (temp === undefined){
                    if (!isNew) throw new Error($3.pool.addGloErr);
                    //在全局数据池新增数据
                    (new Function("name","value","dataCenter","dataCenter."+name+"=value;"))(name,value,that.dataCenter);
                }else{
                    $.MergeObject(temp,value);
                }
            },
            /*
             *   设置组件的值（该方法为了固定组件的参数，防止数据错乱）
             *       uuid            唯一标识
             *       name            数据池中需要设置的值的对象
             *       value           存储进来的数据
             *       isAdd           是否新增
             * */
            setData_com:function(uuid,name,value,isNew){
                //参数检查处理,检查是否为组件禁止修改数据，初始化参数
                this.checkParam_com(name);
                isNew = $.is.Boolean(isNew) || false;

                var temp = (new Function("uuid","name","dataCenter","return dataCenter.pool."+uuid+"."+name+";"))(uuid,name,that.dataCenter);
                if (temp === undefined){
                    if (!isNew) throw new Error($3.pool.addComErr);
                    //在全局数据池新增数据
                    (new Function("uuid","name","value","dataCenter","dataCenter.pool"+uuid+"."+name+"=value;"))(uuid,name,value,that.dataCenter);
                }else{
                    $.MergeObject(temp,value);
                }

            },
            //获取全局对象的数据
            getData_glo:function(name,key){

            },
            getData_com:function(name){

            }
        },
        //组件中使用工具
    };

    (function(){

        return window.UI  = UI_global;

    })(UI_global);
})(window,document,(function(){

    //dom处理函数
    function dom_global (selector){
        var dom = function(selector){
            this.selector = document.querySelectorAll(selector);
        };
        dom.prototype = {
            //插入页面
            html:function(tpl){
                if(this.selector.length === 1){
                    this.selector[0].innerHTML = tpl;
                }else{
                    tool_global.each(this.selector,function(node){
                        node.innerHTML = tpl;
                    })
                }
            },
            //设置dom的属性和得到dom的属性
            attr:function(name,value){

            }
        };
        return new dom(selector);
    };

    //全局工具
    var tool_global = {
        //判断key是否属于该对象
        hasOwn: function(obj, key){
            return Object.prototype.hasOwnProperty.call(obj, key)
        },
        //获得对象的keys
        keys: function(obj){
            if(Object.keys) return Object.keys(obj);

            var keys = [];
            for(var key in obj){
                if(this.hasOwn(obj, key)) keys.push(key);
            };
            return keys
        },
        //each循环
        each:function(obj,callback){
            var keys = tool_global.keys(obj)
            var i = 0, len = keys.length, key, item;
            while( i < len ){
                key = keys[i++];
                item = obj[key];
                callback.call(obj, item, key);
            }
        },
        //合并对象,将第二个合并到第一个对象上
        MergeObject:function(target,source){
            if(Object.assign){
                return Object.assign(target, source)
            }
            var targetKeys = this.keys(target),
                sourceKeys = this.keys(source),
                i = 0
            var len = sourceKeys.length;
            while( i < len ){
                var key = sourceKeys[i++]
                target[key] = source[key];
            }
            return target;
        },
        /*
        *   检查类型 使用：is.类型（参数）
        *       正确，return 传入值
        *       错误, return false
        * */
        is:(function checkType(){
            var is ={
                types : ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Window", "HTMLDocument"]
            };
            for(var i = 0, c; c = is.types[i ++ ]; ){
                is[c] = (function(type){
                    return function(obj){
                        var temp = Object.prototype.toString.call(obj) == "[object " + type + "]";
                        if (temp) temp = obj;
                        return temp;
                    }
                })(c);
            };
            return is;
        })(),
        //获取唯一的guid唯一标识
        uuid:function(){
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        },
    };

    //ajax工具
    var ajax_global ={
        initParam:{
            //time:10000,                             //超时时间（单位：毫秒）
            type:"",                                //请求类型（get、post...）
            url:"",                                 //请求接口
            data:"",                                //请求参数（格式：json对象）  例子：{"name":"gerry","age":"88"}
            async:true,                             //同|异步请求 （异步：true 同步：false）
            dataType:'',                            //返回值处理（可拓展）   目前只实现：JSON
            success:function(data){},               //请求成功处理事件
            error:function(x,xx,xxx){},             //请求失败处理事件
            timeout:function(){},                   //请求超时处理事件
            requestHeader:{}                        //报文头设置（可自定义报文头）
        },
        //创建xhr对象
        createXhrObject:function(){
            var xhr;
            try{
                // IE7 已经有了XMLHttpRequest对象
                XMLHttpRequest?(xhr= new XMLHttpRequest()):(xhr= new ActiveXObject('Microsoft.XMLHTTP'));
            }catch (e){
                throw new Error('ajax:Could not create an XHR object.')
            };
            return xhr;
        },
        //ajax参数处理，可拓展
        dealWithParam:function(ajaxSetting,xhr){
            switch (ajaxSetting.type.toUpperCase()) {
                case "GET":
                    var getParam = "?";
                    tool_global.each(ajaxSetting.data,function(item,index){
                        getParam +=(encodeURI(index)+"="+encodeURI(item)+"&")
                    });
                    //处理最后一位"&"符号，其实不处理也没事，强迫症犯了，尴尬
                    getParam =getParam.substr(0,getParam.length-1);
                    //打开请求
                    xhr.open(ajaxSetting.type.toUpperCase(), ajaxSetting.url+=getParam, ajaxSetting.async);
                    break;
                case "POST":
                    //打开请求
                    xhr.open(ajaxSetting.type.toUpperCase(), ajaxSetting.url, ajaxSetting.async);
                    var postParam ="";
                    xhr.setRequestHeader("content-type","application/x-www-form-urlencoded");
                    tool_global.each(ajaxSetting.data,function(item,index){
                        postParam +=(index+"="+item+"&")
                    });
                    //处理最后一位"&"符号，其实不处理也没事，强迫症犯了，尴尬
                    postParam =postParam.substr(0,postParam.length-1);
                    xhr.postParam = postParam;
                    break;
            };
            return xhr;
        },
        //通用ajax
        common:function(options){
            //合并参数对象
            var ajaxSetting = tool_global.MergeObject(ajax_global.initParam,options);

            //创建xhr对象
            var xhr = ajax_global.createXhrObject();

            //针对某些特定版本的mozillar浏览器的BUG进行修正
            xhr.overrideMimeType?(xhr.overrideMimeType("text/javascript")):(null);

            //针对IE8的xhr做处理    PS：ie8下的xhr无xhr.onload事件，所以这里做判断
            xhr.onload===undefined?(xhr.xhr_ie8=true):(xhr.xhr_ie8=false);

            //参数处理（get和post）,包括xhr.open     get:拼接好url再open   post:先open，再设置其他参数
            ajaxSetting.data === ""?(xhr.open(ajaxSetting.type.toUpperCase(), ajaxSetting.url, ajaxSetting.async)):(xhr = ajax_global.dealWithParam(ajaxSetting,xhr));

            //设置超时时间（只有异步请求才有超时时间）
            ajaxSetting.async?(xhr.timeout = ajaxSetting.time):(null);

            //设置http协议的头部
            tool_global.each(ajaxSetting.requestHeader,function(item,index){xhr.setRequestHeader(index,item)});

            //onload事件（IE8下没有该事件）
            xhr.onload = function(e) {
                if(this.status == 200||this.status == 304){
                    ajaxSetting.dataType.toUpperCase() == "JSON"?(ajaxSetting.success(JSON.parse(xhr.responseText))):(ajaxSetting.success(xhr.responseText));
                }else{
                    /*
                     *  这边为了兼容IE8、9的问题，以及请求完成而造成的其他错误，比如404等
                     *   如果跨域请求在IE8、9下跨域失败不走onerror方法
                     *       其他支持了Level 2 的版本 直接走onerror
                     * */
                    ajaxSetting.error(e.currentTarget.status, e.currentTarget.statusText);
                }
            };

            //xmlhttprequest每次变化一个状态所监控的事件（可拓展）
            xhr.onreadystatechange = function(){
                switch(xhr.readyState){
                    case 1://打开
                        //do something
                        break;
                    case 2://获取header
                        //do something
                        break;
                    case 3://请求
                        //do something
                        break;
                    case 4://完成
                        //在ie8下面，无xhr的onload事件，只能放在此处处理回调结果
                        xhr.xhr_ie8?((xhr.status == 200 || xhr.status == 304)?(ajaxSetting.dataType.toUpperCase() == "JSON"?(ajaxSetting.success(JSON.parse(xhr.responseText))):(ajaxSetting.success(xhr.responseText))):(null)):(null);
                        break;
                };
            };

            //ontimeout超时事件
            xhr.ontimeout = function(e){
                ajaxSetting.timeout(999,e?(e.type):("timeout"));   //IE8 没有e参数
                xhr.abort();  //关闭请求
            };

            //错误事件，直接ajax失败，而不走onload事件
            xhr.onerror = function(e){
                ajaxSetting.error();
            };

            //发送请求
            xhr.send((function(result){result == undefined?(result =null):(null);return result;})(xhr.postParam));
        },
        //异步get请求
        get:function(url,data,success,error,timeout){
            var ajaxParam ={
                type:"get",
                url:url,
                data:data,
                success:success,
                error:error,
                timeout:timeout
            };
            this.common(ajaxParam);
        },
        //异步post请求
        post:function(url,data,success,error,timeout){
            var ajaxParam ={
                type:"post",
                url:url,
                data:data,
                success:success,
                error:error,
                timeout:timeout
            };
            this.common(ajaxParam);
        },
        //同步post请求
        postSync:function(url,data,success,error,timeout){
            var ajaxParam ={
                type:"post",
                url:url,
                data:data,
                async:false,
                success:success,
                error:error,
                timeout:timeout
            };
            this.common(ajaxParam);
        },
        /*
         * 长轮询的实现
         *   a. 业务上只需要得到服务器一次响应的轮询
         *   b. 业务上需要无限次得到服务器响应的轮询
         *
         *   param: url   请求接口地址
         *          data  请求参数
         *          successEvent    成功事件处理
         *          isAll           是否一直请求（例如，等待付款完成业务，只需要请求一次）
         *          timeout         ajax超时时间
         *          timeFrequency   每隔多少时间发送一次请求
         *          error           错误事件
         *          timeout         超时处理
         * */
        longPolling:function(url,data,successEvent,isAll,timeout,timeFrequency,errorEvent,timeoutEvent){
            var ajaxParam ={
                time:timeout,
                type:"post",
                url:url,
                data:data,
                async:false,
                success:function(date){
                    successEvent(data);
                    var timer = setTimeout(function(){
                        this.longPolling(url,data,successEvent,isAll,errorEvent,timeoutEvent);
                    },timeFrequency);
                    //业务需求判断，是否只需要得到一次结果
                    if (!isAll) clearTimeout(timer);
                },
                //如果走了error说明该接口有问题，没必要继续下去了
                error:errorEvent,
                timeout:function(){
                    timeoutEvent();
                    setTimeout(function(){
                        this.longPolling(url,data,successEvent,isAll,errorEvent,timeoutEvent)
                    },timeFrequency);
                }
            };
            this.common(ajaxParam);
        }
    };

    //模板引擎
    var template_global = {
        template:function(tpl, data){
            var reg = /<%([^%>]+)?%>/g,
                regOut = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g,
                code = 'var r=[];\n',
                cursor = 0;

            var add = function(line, js) {
                js? (code += line.match(regOut) ? line + '\n' : 'r.push(' + line + ');\n') :
                    (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
                return add;
            }
            while(match = reg.exec(tpl)) {
                add(tpl.slice(cursor, match.index))(match[1], true);
                cursor = match.index + match[0].length;
            }
            add(tpl.substr(cursor, tpl.length - cursor));
            code += 'return r.join("");';
            return new Function(code.replace(/[\r\t\n]/g, '')).apply(data);
        }
    };

    //错误信息
    var errMsg_global = {
        pool:{
            forbidUpdate:function(param){ return "数据池参数："+param+"，禁止修改！" },
            comErr:function(param){return "组件参数："+param+"，禁止修改！" },
            addGloErr:"请确认是否为数据池中数据，如果你想拓展/新增数据，请将参数isNew设置为true。",
            addComErr:"请确认是否为组件中的数据，如果你想拓展组件数据池数据，请将参数isNew设置为true。"
        }


    };

    //输出工具
    return {
        dom:dom_global,
        //注入工具
        tool:{
            each:tool_global.each,
            MergeObject:tool_global.MergeObject,
            uuid:tool_global.uuid,
            is:tool_global.is
        },
        ajax:{
            common:ajax_global.common,
            get:ajax_global.get,
            post:ajax_global.post,
            postSync:ajax_global.postSync,
            longPolling:ajax_global.longPolling
        },
        template:template_global.template,
        errMsg:errMsg_global
    }
})());