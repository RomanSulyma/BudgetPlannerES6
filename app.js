
    let budgetController = (function() {

        function generateID() {
            const id = data.currentid;
            data.currentid += 1;
            return id;
        }

        let data =  {
            dataObjects : [],
            income : 0,
            incomePercent : 0,
            expansePercent : 0,
            expanse : 0,
            currentid : 0,
            totalBalance : 0
        };

        let dataObject = function (type, description, value) {
            this.type = type;
            this.value = value;
            this.description = description;
            this.id = 0;
            this.percent = 0;
        };

        return {

            addDataObject : (dataObject) => {
                dataObject.id = generateID();
                data.dataObjects.push(dataObject);
            },

            getData : () => {
                return data;
            },

            deleteElem : (id) => {

                const deleteElem = data.dataObjects.find( (value) => {
                    if(value.id == id) {
                        return value;
                    }
                });
                const index = data.dataObjects.indexOf(deleteElem);
                data.dataObjects.splice(index, 1);

            },

            calculateBudget : () => {

                let total = 0, income = 0, expanse = 0;

                 data.dataObjects.forEach(value => {

                     if(value.type === 'inc'){
                         total += parseInt(value.value);
                         income += parseInt(value.value);
                     } else if(value.type === 'exp') {
                         total -= parseInt(value.value);
                         expanse += parseInt(value.value);
                     }

                });

                data.totalBalance = total;
                data.expanse = expanse;
                data.income = income;

            },

            calculatePercent : () => {

                data.dataObjects.forEach(value => {
                    value.percent = Math.abs(Math.round((value.value / data.totalBalance) * 100));
                });
                data.incomePercent = Math.abs(Math.round((data.income / data.totalBalance) * 100));
                data.expansePercent = Math.abs(Math.round((data.expanse / data.totalBalance) * 100));

                if(data.expanse == 0 || data.income == 0) {
                    data.incomePercent = 0;
                    data.expansePercent = 0;
                }

            },

            getDataObject : (type, description, value)  => {
                return new dataObject(type, description, value);
            }
        }


    })();

    let UIController = (function () {

        const DOMNames = {
            addbtn : '.add__btn',
            inputDescription : '.add__description',
            inputValue : '.add__value',
            inputType : '.add__type',
            incomeParent : '.income__list',
            expenseParent : '.expenses__list',
            budgetTotalValue : '.budget__value',
            incomeValue : '.budget__income--value',
            expensesValue : '.budget__expenses--value',
            month : '.budget__title--month',
            container : '.container',
            deleteButton : 'ion-ios-close-outline',
            UIPercentage : '.item__percentage',
            expencesPercentage : '.budget__expenses--percentage',
            incomePercentage : '.budget__income--percentage'
        };

        return {

            getInputElement : () => {
                const type = document.querySelector(DOMNames.inputType).value;
                const description = document.querySelector(DOMNames.inputDescription).value;
                const value = document.querySelector(DOMNames.inputValue).value;

                return budgetController.getDataObject(type, description, value);
            },

            cleanFields : () => {
                document.querySelector(DOMNames.inputDescription).value = "";
                document.querySelector(DOMNames.inputValue).value = "";
            },

            addElementToUI : (dataObject) => {

                let htmlElem = '<div class="item clearfix" id="%id">\n' +
                    '                    <div class="item__description">%description</div>\n' +
                    '                    <div class="right clearfix">\n' +
                    '                        <div class="item__value">%value</div>\n' +
                    '                        <div class="item__percentage">10%</div>\n' +
                    '                        <div class="item__delete">\n' +
                    '                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\n' +
                    '                        </div>\n' +
                    '                    </div>\n' +
                    '                </div>';

                htmlElem = htmlElem.replace('%description', dataObject.description);
                htmlElem = htmlElem.replace('%value', dataObject.value);

                if(dataObject.type === 'inc') {
                    htmlElem = htmlElem.replace('%id', dataObject.id);
                    document.querySelector(DOMNames.incomeParent).insertAdjacentHTML("beforeend", htmlElem);
                } else if (dataObject.type === 'exp') {
                    htmlElem = htmlElem.replace('%id', dataObject.id);
                    document.querySelector(DOMNames.expenseParent).insertAdjacentHTML("beforeend", htmlElem);
                }
            },

            updateDataUI : (data) => {
                document.querySelector(DOMNames.budgetTotalValue).textContent = data.totalBalance;
                document.querySelector(DOMNames.incomeValue).textContent = data.income;
                document.querySelector(DOMNames.expensesValue).textContent = data.expanse;

                data.dataObjects.forEach(function (value ) {
                    document.getElementById(value.id).querySelector(DOMNames.UIPercentage).textContent = `${value.percent}%`;
                });

                    document.querySelector(DOMNames.incomePercentage).textContent = `${data.incomePercent}%`;
                    document.querySelector(DOMNames.expencesPercentage).textContent = `${data.expansePercent}%`;
            },

            validateInput : (dataObject) => {
                if(dataObject.value == 0 || isNaN(dataObject.value) || dataObject.value.length === 0 || dataObject.value.includes('-')) {
                    return false
                }
                if(dataObject.description.length === 0) {
                    return false;
                }
                return true;
            },

            deleteFromUI : (event) => {
                let node = event.target.parentNode.parentNode.parentNode.parentNode;
                const id = node.id;
                node.parentNode.removeChild(node);

                return id;
            },

            changeColor : () => {
            document.querySelector(DOMNames.addbtn).classList.toggle('red');
                document.querySelector(DOMNames.addbtn).classList.toggle('red-focus');
            document.querySelector(DOMNames.inputValue).classList.toggle('red');
                document.querySelector(DOMNames.inputValue).classList.toggle('red-focus');
            document.querySelector(DOMNames.inputDescription).classList.toggle('red');
                document.querySelector(DOMNames.inputDescription).classList.toggle('red-focus');
            document.querySelector(DOMNames.inputType).classList.toggle('red');
                document.querySelector(DOMNames.inputType).classList.toggle('red-focus');
            },

            getDomNames : () => {
                return DOMNames;
            }

        }

    })();

    let mainController = (function (budgetController, UIController) {

        function addElement () {

            let dataObject = UIController.getInputElement();
            UIController.cleanFields();

            if(UIController.validateInput(dataObject)) {

                budgetController.addDataObject(dataObject);
                UIController.addElementToUI(dataObject);
                budgetController.calculateBudget();
                budgetController.calculatePercent();
                UIController.updateDataUI(budgetController.getData());

            } else {
                alert('validation error!');
            }

        }

        function deleteElement (event) {

            const id = UIController.deleteFromUI(event);
            budgetController.deleteElem(id);
            budgetController.calculateBudget();
            budgetController.calculatePercent();
            UIController.updateDataUI(budgetController.getData());

        }

        return {
            initialize : (DomNames) => {

                const monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];
                document.querySelector(DomNames.addbtn).addEventListener('click', () => {
                    addElement();
                });
                document.querySelector(DomNames.month).textContent = monthNames[new Date().getMonth()];
                document.querySelector(DomNames.container).addEventListener('click', (event) => {
                    if(event.target.className === DomNames.deleteButton) {
                        deleteElement(event);
                    }
                });
                document.querySelector(DomNames.inputType).addEventListener('change', () => {
                    UIController.changeColor();
                })
            }
        }

    })(budgetController, UIController);

    mainController.initialize(UIController.getDomNames());