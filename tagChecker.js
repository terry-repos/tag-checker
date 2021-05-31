// Helpers
let xsts = (x) => (x!==null && x!==undefined); 
let tag_to_str = (tag) => tag.replace("<","&lt;").replace(">","&gt;");

// Handle dom elements
let txtArea = document.querySelector("#tagTextarea");
txtArea.value = txtArea.value.trim();
txtArea.addEventListener('input', (ev) => validate_on_input( ));

let validationOutput = document.querySelector("#validationOutput");

// Main validation controller
let validate_on_input = ( ) => {
    let paragraphs = txtArea.value.split(/\r?\n/g);

    validationOutput.innerHTML="";
    paragraphs.forEach((p) => {
        p = p.trim();
        if ( p.length===0 ) return;

        let extractedTags = extract_tags( p  );
        let unmatchedTags = get_unmatched_tags( extractedTags );
        let lineValidation = make_validation_output( p, unmatchedTags );

        validationOutput.innerHTML += `${lineValidation}<br />`;
    });
}

let extract_tags = ( txt ) => {
    let tagRegex = /<\/?[A-Z]>/g;
    return txt.match(tagRegex);
}

let get_unmatched_tags = (tags) => {
    if (!xsts(tags)) return [];
    let unmatchedTags = [...tags];
    let lastIterationMatched = true;

    // match adjacents.
    while ( tags.length > 0 && lastIterationMatched ){
        tags = [...unmatchedTags];

        lastIterationMatched = false;
        tags.map((tag, tagI) => {
            //if not the last tag, and is opening tag...
            if ( tagI !== (tags.length-1) && !tag.includes("/") ){
                // if next tag is a closing tag, and matches letter of opening...
                if ( tags[ tagI+1 ].includes("/") && tags[ tagI+1 ].includes( tag[1] ) ) {
                    // we can remove both the opening and closing tags!
                    unmatchedTags.splice(tagI, 2);
                    lastIterationMatched = true;
                }
            }
        });
    }
    return unmatchedTags;
}

let make_validation_output = ( line, tags ) => {
    let output;
    if (tags.length===0){
        output = "Correctly tagged paragraph";
    } else {
        let firstTag = tag_to_str(tags[0]);
        
        let nestingError = (tags.length > 2 && (tags.length % 2)===0);
        if ( nestingError ){
            //malformed nested tags
            let newTag1 = ( tags[1].includes("/") ) ? `${tags[1].replace('/',"")}` : `${tags[1].replace("<","</")}`;
            output = `Expected ${tag_to_str(newTag1)} found ${tag_to_str(tags[2])}`;
        } else if ( tags.length <= 2) {
            //widow tag
            output = ( firstTag.includes("/") ) ? `Expected # found ${firstTag}` : `Expected ${firstTag.replace("<","</")} found #`;
            console.log("end of paragraph: ", output);
        }
    }
    return output;
}