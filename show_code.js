let check={
    "task":"console.log('Hello World')",
    "code":["console","log"],
    "console":["Hello ","World"]
}

function createIDE(e){
    let l={
        "en":["code","console"],
        "ru":["код","консоль"],
        "ja":["コード","コンソール"]
    }
    e.innerHTML="<div class='label' style='font-family:Arial'>"+l[languare][0]+"</div><div class='codeView' style='"+((navigator.userAgent.indexOf('Firefox')>0)?'overflow:hidden;':'overflow:auto;')+"'><pre class='code_show'></pre><textarea class='code_text' id='codeedit' spellcheck='false' autocomplete='off' autocorrect='off' autocapitalize='off' wrap='off' oninput='code_edit(this,this.previousElementSibling)'>"+check.task+"</textarea></div><div class='label bottoms_panel'><div style='font-family:Arial;text-align:left;width:100%;display:block;'>"+l[languare][1]+"</div><div class='code_bottom' onclick='code_run();' style='font-family:Arial;font-size:14px;align-self: center;justify-self: center;'>Run<span style='font-size:15px;margin-left:8px;padding-bottom:3px'>▶<span></div></div><div id='console'></div>"
    code_edit(e.getElementsByClassName('code_text')[0],e.getElementsByClassName('code_show')[0])
    document.addEventListener("paste",()=>{code_edit(document.getElementsByClassName('code_text')[0],document.getElementsByClassName('code_show')[0])})
    window.console = {log:function(str){document.getElementById("console").innerHTML=str}}
    document.getElementById('codeedit').addEventListener('keydown',e=>{if(e.key=='Tab'){e.preventDefault();document.execCommand("insertText",false,'\t');}});
}

function code_edit(edit,show){
    show.innerHTML=syntax_javascipt(edit.value);
    let e=show.getBoundingClientRect();
    edit.style.width =(e.width+100)+'px';
    edit.style.height=(e.height+100)+'px';
}

function syntax_javascipt(code){
    function isAlphaNumericChar(char){return char&&/[0-9a-z_\$]/i.test(char);}
    const states={NONE:0,SINGLE_QUOTE:1,DOUBLE_QUOTE:2,ML_QUOTE:3,REGEX_LITERAL:4,SL_COMMENT:5,ML_COMMENT:6,NUMBER_LITERAL:7,KEYWORD:8,SPECIAL:9,ELEMENT:10};
    const keywords=["async","await","break","case","class","const","continue","debugger","default","delete","do","else","enum","export","extends","for","from","function","get","if","implements","import","in","instanceof","interface","let","new","of","package","private","protected","public","return","set","static","super","switch","throw","try","typeof","var","void","while","with","yield","catch","finally"];
    const specials=["this","null","true","false","undefined","NaN","Infinity"]
    const elements=["window","document","addEventListener","removeEventListener"];
    let output='',state=states.NONE;
    for (let i=0;i<code.length;i++){
        let char=code[i],prev=code[i-1],next=code[i+1];
        if(state==states.NONE&&char=='/'&&next=='/'){state=states.SL_COMMENT;output+="<span class='code_elem_1'>"+char;continue;}
        if(state==states.SL_COMMENT&&char=='\n'){state=states.NONE;output+=char+'</span>';continue;}
        if(state==states.NONE&&char=='/'&&next=='*'){state=states.ML_COMMENT;output+="<span class='code_elem_1'>"+char;continue;}
        if(state==states.ML_COMMENT&&char=='/'&&prev=='*'){state=states.NONE;output+=char+'</span>';continue;}
        const closingCharNotEscaped=prev!='\\'||prev=='\\'&&code[i-2]=='\\';
        if(state==states.NONE&&char=='\''){state=states.SINGLE_QUOTE;output+="<span class='code_elem_2'>"+char;continue;}
        if(state==states.SINGLE_QUOTE&&char=='\''&&closingCharNotEscaped){state=states.NONE;output+=char+'</span>';continue;}
        if(state==states.NONE&&char=='"'){state=states.DOUBLE_QUOTE;output+="<span class='code_elem_2'>"+char;continue;}
        if(state==states.DOUBLE_QUOTE&&char=='"'&&closingCharNotEscaped){state=states.NONE;output+=char+'</span>';continue;}
        if(state==states.NONE&&char=='`'){state=states.ML_QUOTE;output+="<span class='code_elem_2'>"+char;continue;}
        if(state==states.ML_QUOTE&&char=='`'&&closingCharNotEscaped){state=states.NONE;output+=char+'</span>';continue;}
        if(state==states.NONE&&char=='/'){
            let word='',j=0,isRegex=true;
            while(i+j>=0){j--;
                if('+/-*=|&<>%,({[?:;'.indexOf(code[i+j])!=-1)break;
                if(!isAlphaNumericChar(code[i+j])&&word.length>0)break;
                if(isAlphaNumericChar(code[i+j]))word=code[i+j]+word;
                if(')]}'.indexOf(code[i+j])!=-1){isRegex=false;break;}
            }
            if(word.length>0&&!keywords.includes(word))isRegex=false;
            if(isRegex){state=states.REGEX_LITERAL;output+="<span class='code_elem_2'>"+char;continue;}
        }
        if(state==states.REGEX_LITERAL&&char=='/'&&closingCharNotEscaped){state=states.NONE;output+=char+'</span>';continue;}
        if(state==states.NONE&&/[0-9]/.test(char)&&!isAlphaNumericChar(prev)){state=states.NUMBER_LITERAL;output+="<span class='code_elem_4'>"+char;continue;}
        if(state==states.NUMBER_LITERAL&&!isAlphaNumericChar(char)){state=states.NONE;output+='</span>'}
        if(state==states.NONE&&!isAlphaNumericChar(prev)){
            let word='', j=0;
            while(code[i+j]&&isAlphaNumericChar(code[i+j])){word+=code[i+j];j++;}
            if(keywords.includes(word)){state=states.KEYWORD;output+="<span class='code_elem_3'>";}
            if(specials.includes(word)){state=states.SPECIAL;output+="<span class='code_elem_3'>";}
            if(elements.includes(word)){state=states.ELEMENT;output+="<span class='code_elem_2'>";}
        }
        if((state==states.KEYWORD||state==states.SPECIAL||state==states.ELEMENT)&&!isAlphaNumericChar(char)){state=states.NONE;output+='</span>';}
        if(state==states.NONE&&'+-/*=&|%!<>?:'.indexOf(char)!=-1){output+="<span class='code_elem_5'>"+char+'</span>';continue;}
        output+=char.replace('<', '&lt;');
    }
    return output.replace(/\n/gm,'<br>').replace(/\t/g,'&Tab;').replace(/^\s+|\s{2,}/g,(a)=>new Array(a.length+1).join('&nbsp;')); //let symbol_tab=Array(4).join('\u00a0'); //.replace(/\t/g,document.createTextNode('\u00a0'))
}

function code_run(){
    try{eval(document.getElementById('codeedit').value)}catch(e){console.log(e)}
    let c=true;
    check.console.forEach((e)=>{if(!document.getElementById('console').innerText.includes(e)){c=false}});
    check.code.forEach((e)=>{if(!document.getElementById('codeedit').value.includes(e)){c=false}});
    if(c){go_story(true)}
}
