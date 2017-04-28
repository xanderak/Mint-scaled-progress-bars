// ==UserScript==
// @name        Mint.com scaled budget bars
// @include     https://*.mint.com/*
// @include     https://mint.intuit.com/*
// @description Make bars scale relative to how big the budgets are.
// @namespace   
// @author      Terry Raymond
// @version     0.1
// @homepage    https://github.com/xanderak/Mint-scaled-budget-bars
// @grant       none
// @noframes
// ==/UserScript==
//

function scaleBars() {
    //budgets load after page loads, wait for them to show before running script.
    var elmLoading = document.getElementById("budgetsLoading-indicator");
    if (elmLoading === null || elmLoading.getAttribute("class") != 'hide') {
        setTimeout(scaleBars, 250);
        return;
    }

    //Load budget elements
    var elmList = document.getElementById("spendingBudget-list-body");
    var elmHTMLColl = elmList.children;
    var elmBudgets = [];
    var i;
    for (i=0; i < elmHTMLColl.length; i++) elmBudgets[i] = elmList.children[i]; //convert HTML collection to an array
    elmBudgets.push(document.getElementById("spendingEE-list-total"));
    
    var budgets = [];  //new object with screen elements and budget values
    var maxMoney = 1;  //maximum amount to scale everything to.
    const defMaxBarWidth="513"; //default max bar width in Mint

    //populate all the budget objects, find max money to scale to
    for (i=0; i < elmBudgets.length; i++){
        var elmMoneys = elmBudgets[i].getElementsByClassName("money actual");
        var elmGrayBar = elmBudgets[i].getElementsByClassName("total_bar");
        var elmProgBar = elmBudgets[i].getElementsByClassName("progress_bar");
        if (elmProgBar === null) {
            elmProgBar = elmBudgets[i].getElementsByClassName("progress_bar_full");
        }
        budgets[i] = {
            spent: elmMoneys[0].innerHTML.match(/[-\d]/g).join("") * 1,
            planned: elmMoneys[1].innerHTML.match(/[-\d]/g).join("") * 1,
            grayBar: elmGrayBar[0],
            progBar: elmProgBar[0]
        };
        maxMoney = Math.max(maxMoney, budgets[i].spent, budgets[i].planned);
    }

    //Scale, color, and adjust bars
    for (i=0; i < budgets.length; i++){
        var newGrayBarWidth = Math.max(10, defMaxBarWidth * budgets[i].planned / maxMoney);
        var newProgBarWidth = Math.max(10, defMaxBarWidth * budgets[i].spent / maxMoney);

        if (budgets[i].spent < 0) {
            var shift = budgets[i].spent/maxMoney * defMaxBarWidth;
            newGrayBarWidth -= shift;
            budgets[i].grayBar.setAttribute("style", "width:"+newGrayBarWidth+"px; transform: translate(" + shift + "px, 0px); background:green;");
            budgets[i].progBar.setAttribute("style", "display: none"); 
        } else if (budgets[i].spent < budgets[i].planned) {
            budgets[i].grayBar.setAttribute("style", "width:"+newGrayBarWidth+"px; background:green;");
            budgets[i].progBar.setAttribute("style", "width:"+newProgBarWidth+"px; background:gray;"); 
        } else {
            budgets[i].grayBar.setAttribute("style", "width:"+newGrayBarWidth+"px; z-index: 100; background:gray;");
            budgets[i].progBar.setAttribute("style", "width:"+newProgBarWidth+"px; z-index: 90; background:red;"); 
        }
    }
}

scaleBars();