const loadData = function (classname, classText, propertiesData, methodsData, index) {
    const docHeading = classname;
    const docText = classText;
    document.getElementsByClassName("class-header")[index].innerHTML = docHeading;
    document.getElementsByClassName("class-header-text")[index].innerHTML = docText;
    
    const propertiesTable = document.getElementsByClassName("properties-table")[index];
    const methodsTable = document.getElementsByClassName("methods-table")[index];

    if (methodsData) {
        methodsData.forEach(entry => {
            const newElement = document.createElement("tr");
        
            const newReturns = entry.RETURNS.replace(/\|/g, "<br>|");
        
            newElement.innerHTML = `
                <td>${entry.NAME}</td>
                <td>${entry.PARAMETERS}</td>
                <td>${newReturns}</td>
                <td>${entry.DESCRIPTION}</td>
            `;
            
            methodsTable.append(newElement);
        })

    }

    if (propertiesData) {
        propertiesData.forEach(entry => {
            const newElement = document.createElement("tr");
        
            const newType = entry.TYPE.replace(/\|/g, "<br>|");
            const newName = entry.NAME + (entry.READONLY === "TRUE" ? "<span>(Readonly)</span>" : "");
        
            newElement.innerHTML = `
                <td>${newName}</td>
                <td>${newType}</td>
                <td>${entry.DEFAULT}</td>
                <td>${entry.DESCRIPTION}</td>
            `;
            
            propertiesTable.append(newElement);
        });

    } else {
        return [propertiesTable, document.getElementsByClassName("prop")[index]];
    }

}

const return1 = loadData("Buildable", `The main library class. Contains references to utility classes for manipulating dynamic module properties, methods for DOM manipulation and methods for creating, deleting and displaying Module instances.`, buildableProperties, buildableMethods, 0);
const return2 = loadData("ModuleDrag", `A utility class responsible for changing the position of modules as referenced in the Buildable class.`, null, moduleDragMethods, 1);
const return3 = loadData("ModuleSize", `A utility class responsible for changing the size of modules as referenced in the Buildable class.`, null, moduleSizeMethods, 2);
const return4 = loadData("ModuleSnap", `A utility class responsible for snapping modules to other modules as referenced in the Buildable class.`, null, moduleSnapMethods, 3);
const return5 = loadData("Module", `The modules class that represents a DOM object. Initiated within the Buildable class.`, moduleProperties, moduleMethods, 4);

if (return1) return1.forEach(e => e.remove());
if (return2) return2.forEach(e => e.remove());
if (return3) return3.forEach(e => e.remove());
if (return4) return4.forEach(e => e.remove());
if (return5) return5.forEach(e => e.remove());