/**
 * @function: my alert
 * @description: deal the error while compliling
 */


function alertOk(){
    document.getElementById('alert-mask').remove();
}

function alertReset(){
    document.getElementById('alert-mask').remove();
    document.getElementById('s1-split').style.display = 'none';
    document.getElementById('s2-lexical').style.display = 'none';
    document.getElementById('source-code').value = '';
    updateS1Button();
}

function eyAlert(e) {
    var d = document.createElement('div');
    d.classList.add('alert-mask');
    d.id = 'alert-mask';
    d.innerHTML = `<div class="alert-main">\
        <div class="alert-head">ERROR</div>\
        <div class="alert-content">${e}</div>\
        <div class="alert-ok">\
            <button class="s-button s-fl" onclick = "alertOk()">OK</button>\
            <button class="s-button s-blue s-fr" onclick = "alertReset()">Reset</button>\
            <div class="s-clear"></div>\
        </div>\
    </div>`;
    document.getElementById('main').appendChild(d);
}
