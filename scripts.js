const Modal = {
    open() {
        //Abrir moda
        //Adicionar classe active ao modal
        document.querySelector('.modal-overlay').classList.add('active');
    },
    close() {
        //Remover a classe active do modal
        document.querySelector('.modal-overlay').classList.remove('active');
    }
}

const Storage = {
    get(){
        //Converter o array que estava guardado como string de volta para um array
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions){
        //O localstorage guarda sempre string, então converter o array em string antes de guardar
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    },
}


const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index){
        Transaction.all.splice(index, 1);
    
        App.reload();
    },
    incomes(){
        //Somar as entradas
        let income = 0;

        Transaction.all.forEach((transaction) =>{
            if(transaction.amount > 0){
                income += transaction.amount;
            }
        })

        return income;
    },
    expenses() {
        let expense = 0;

        Transaction.all.forEach((transaction) =>{
            if(transaction.amount < 0){
                expense += transaction.amount;
            }
        })

        return expense;
    },
    total(){
        //entradas-saidas
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    //Adicionar a transação no html
    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    //Criar a 'caixa' da transação e colocar os valores na mesma
    innerHTMLTransaction (transaction, index) {

        //Se o transaction.amount for maior que 0, a variavel terá "income", se não, "expense";
        const CSSclass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = 
        `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação"/>
            </td>
        `
        return html;
    },

    //Mostrar os valores de entrada, saída e o saldo final
    updateBalance(){
        document
            .getElementById('incomeDisplay')
            .innerHTML= Utils.formatCurrency(Transaction.incomes());

        document
            .getElementById('expenseDisplay')
            .innerHTML= Utils.formatCurrency(Transaction.expenses());

        document
            .getElementById('totalDisplay')
            .innerHTML= Utils.formatCurrency(Transaction.total());
    },

    clearTransactions(){
        DOM.transactionsContainer.innerHTML = "";
    }
}

//Formatar o valor para dinheiro
const Utils = {
    formatCurrency(value){
        const signal = Number(value) < 0 ? "-" : "";
                                    //Tirando tudo que não é numero no "value" e colocando vazio;
        value = String(value).replace(/\D/, "");

        value = Number(value)/100;

        //Formatando o numero para dinheiro 
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        //Retornando o valor com o sinal na frente
        return signal+value;
    },

    //Formatar o amount registrado
    formatAmount(value){
        value = Number(value) * 100;

        return value;
    },

    //Formatar a data registrada
    formatDate(date){
        //Separar a string date que está 0000-00-00 para um array, que vai ficar "0000","00","00"
        const splittedDate = date.split("-");

        return `${splittedDate[2]}/${splittedDate[1]}/ ${splittedDate[0]}`
    },
}

const Form = {
    description: document.querySelector('input#description'),
    date: document.querySelector('input#date'),
    amount: document.querySelector('input#amount'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validateFields() {
        //Desestruturação
        const { description, amount, date } = Form.getValues();

        //Fazer uma limpeza de espaços vazios e verificar se for vazio
        if(description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Preencha todos os campos.");
        }
    },

    formatValues(){
        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);
        date = Utils.formatDate(date);

        return { description, amount, date };
    },

    clearFields(){
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {

        //Não enviar as informações pela url
        event.preventDefault();


        try {
            //Verificar se n tem nada vazio
            Form.validateFields();

            //Formatar os dados para salvar
            
            const transaction = Form.formatValues();
            //salvar
            Transaction.add(transaction);

            //apagar os dados do form
            Form.clearFields();

            //fechar o modal
            Modal.close();

            //Atualizar a aplicação(Já tem um no transaction.add)
        }catch(error) {
            alert(error.message);
        }
     
    }
}




const App = {
    init(){
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        });
        
        DOM.updateBalance();

        Storage.set(Transaction.all);
    },


    reload(){
        DOM.clearTransactions();
        App.init();
    }
}


App.init();

