/**
 * Created by taony on 2017/08/21.
 */
odoo.define('web.taony_hide_button', function (require) {
    "use strict";

    //odoo底层web定义引用
    var form_widgets = require('web.form_widgets');
    var ajax = require('web.ajax');
    var core = require('web.core');
    var crash_manager = require('web.crash_manager');
    var data = require('web.data');
    var datepicker = require('web.datepicker');
    var dom_utils = require('web.dom_utils');
    var Priority = require('web.Priority');
    var ProgressBar = require('web.ProgressBar');
    var Dialog = require('web.Dialog');
    var common = require('web.form_common');
    var formats = require('web.formats');
    var framework = require('web.framework');
    var Model = require('web.DataModel');
    var pyeval = require('web.pyeval');
    var session = require('web.session');
    var utils = require('web.utils');
    var FormRenderingEngine = require('web.FormRenderingEngine');
    var Pager = require('web.Pager');
    var Sidebar = require('web.Sidebar');
    var View = require('web.View');

    var _t = core._t;
    var QWeb = core.qweb;

    //扩展添加web.FormView中的方法
    var taonyHideButton = require('web.FormView');
    taonyHideButton.include({
        do_push_state: function (state) {
            var self = this;
            this._super.apply(this, arguments);
            //找到定义好的content中的domain表达式
            if (this.options.action.context != undefined) {
                var hide_button = this.options.action.context.taony_hide_button;
            }
            if (hide_button != undefined) {
                var result = this.compute_domain(hide_button);

                if (result == true) {
                    if (this.get("actual_mode") != "view") {
                        this.$buttons.find('.o_form_button_edit').trigger('click');
                    }
                    //目前代码隐藏编辑按钮（其他按钮都可以扩展，可根据业务需求，来显示隐藏那些按钮）
                    //o_form_button_create新增按钮
                    //o_form_button_edit编辑按钮
                    //o_form_button_save保存按钮
                    //o_form_button_cancel取消按钮
                    this.$buttons.find(".o_form_button_edit").hide();
                } else {
                    if (this.get("actual_mode") == "view") {
                        this.$buttons.find(".o_form_buttons_view").show();
                    }
                }
            }
        }
    });
});

/**
 * 另一种定义方法（参考：以前版本odoo的写法）
 openerp.taony_form_hide_button = function(instance){
    instance.web.FormView.include({
            do_push_state: function (state) {
                var self = this;
                this._super.apply(this, arguments);
                var hide_button = this.options.action.context.taony_hide_button

                if(hide_button!=undefined){
                    var result = this.compute_domain(hide_button);

                    if(result==true){
                        if(this.get("actual_mode")!="view"){
                            this.$buttons.find('.oe_form_button_cancel').trigger('click')
                        }
                        this.$buttons.find(".oe_form_buttons_view").hide()
                    }else{
                        if(this.get("actual_mode")=="view") {
                            this.$buttons.find(".oe_form_buttons_view").show()
                        }
                    }
                }
            }
        }
    );

}
 */

/**
 * 在xml文件中具体使用方法，在content中使用domain条件
 <record id="action_easy_genes" model="ir.actions.act_window">
 <field name="name">Information</field>
 <field name="res_model">model_name</field>
 <field name="view_type">form</field>
 <field name="view_mode">tree,form</field>
 <field name="context">{'taony_hide_button':[('state','=','draft'),('sex','=','F')]}</field>
 </record>
 */

/**
 * odoo本周定义计算判断domain方法
 function compute_domain (expr, fields) {
    if (! (expr instanceof Array))
        return !! expr;
    var stack = [];
    for (var i = expr.length - 1; i >= 0; i--) {
        var ex = expr[i];
        if (ex.length == 1) {
            var top = stack.pop();
            switch (ex) {
                case '|':
                    stack.push(stack.pop() || top);
                    continue;
                case '&':
                    stack.push(stack.pop() && top);
                    continue;
                case '!':
                    stack.push(!top);
                    continue;
                default:
                    throw new Error(_.str.sprintf(
                        _t("Unknown operator %s in domain %s"),
                        ex, JSON.stringify(expr)));
            }
        }

        var field = fields[ex[0]];
        if (!field) {
            throw new Error(_.str.sprintf(
                _t("Unknown field %s in domain %s"),
                ex[0], JSON.stringify(expr)));
        }
        var field_value = field.get_value ? field.get_value() : field.value;
        var op = ex[1];
        var val = ex[2];

        switch (op.toLowerCase()) {
            case '=':
            case '==':
                stack.push(_.isEqual(field_value, val));
                break;
            case '!=':
            case '<>':
                stack.push(!_.isEqual(field_value, val));
                break;
            case '<':
                stack.push(field_value < val);
                break;
            case '>':
                stack.push(field_value > val);
                break;
            case '<=':
                stack.push(field_value <= val);
                break;
            case '>=':
                stack.push(field_value >= val);
                break;
            case 'in':
                if (!_.isArray(val)) val = [val];
                stack.push(_(val).contains(field_value));
                break;
            case 'not in':
                if (!_.isArray(val)) val = [val];
                stack.push(!_(val).contains(field_value));
                break;
            default:
                console.warn(
                    _t("Unsupported operator %s in domain %s"),
                    op, JSON.stringify(expr));
        }
    }
    return _.all(stack, _.identity);
}
 */

/*
 * 隐藏动作按钮js事件
 * if (this.sidebar) {
 console.log("触发隐藏动作按钮！");
 this.sidebar.do_hide();
 }
 */