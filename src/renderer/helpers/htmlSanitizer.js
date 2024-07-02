const element = document.createElement('div');

export function SanitizeHTML(content){
    element.innerText = content;
    return element.innerHTML;
}