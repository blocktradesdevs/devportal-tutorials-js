const dsteem = require('dsteem');
//define network parameters
let opts = {};
opts.addressPrefix = 'STX';
opts.chainId =
    '79276aea5d4877d9a25892eaa01b0adf019d3e5cb12a97478df3298ccdd01673';
//connect to a steem node, testnet in this case
const client = new dsteem.Client('https://testnet.steem.vc', opts);

// const dsteem = require('dsteem');
// let opts = {};
// //define network parameters
// opts.addressPrefix = 'STM';
// opts.chainId =
//     '0000000000000000000000000000000000000000000000000000000000000000';
// //connect to a steem node, production in this case
// const client = new dsteem.Client('https://api.steemit.com');

//check permission status
window.submitCheck = async () => {
    //get username
    const username = document.getElementById('username').value;
    //get account to provide active auth
    const newAccount = document.getElementById('newAccount').value;

    //query database for active array
    _data = new Array
    _data = await client.database.getAccounts([username]);
    const activeAuth = _data[0].active;

    //check for username duplication
    const checkAuth = _data[0].active.account_auths;
    var arrayindex = -1;
    var checktext = " does not yet have active permission"
    for (var i = 0,len = checkAuth.length; i<len; i++) {
        if (checkAuth[i][0]==newAccount) {
            arrayindex = i
            var checktext = " already has active permission"
        }
    }
    document.getElementById('permCheckContainer').style.display = 'flex';
    document.getElementById('permCheck').className = 'form-control-plaintext alert alert-success';
    document.getElementById('permCheck').innerHTML = newAccount + checktext;
    console.log(checkAuth);
}

//grant permission function
window.submitPermission = async () => {
    //get username
    const username = document.getElementById('username').value;
    //get private active key
    const privateKey = dsteem.PrivateKey.fromString(
        document.getElementById('privateKey').value
    );
    //get account to provide active auth
    const newAccount = document.getElementById('newAccount').value;

    _data = new Array
    _data = await client.database.getAccounts([username]);
    const activeAuth = _data[0].active;

    //adding of new account to active array
    activeAuth.account_auths.push([
        newAccount,
        parseInt(activeAuth.weight_threshold)
    ]);
    //sort array required for steem blockchain
    activeAuth.account_auths.sort();

    //object creation
    const accObj = {
        account: username,
        json_metadata: _data[0].json_metadata,
        memo_key: _data[0].memo_key,
        active: activeAuth,
    }
    
    //account update broadcast
    client.broadcast.updateAccount(accObj, privateKey).then(
        function(result) {
            console.log(
                'included in block: ' + result.block_num,
                'expired: ' + result.expired
            );
            document.getElementById('permCheckContainer').style.display = 'flex';
            document.getElementById('permCheck').className = 'form-control-plaintext alert alert-success';
            document.getElementById('permCheck').innerHTML = "active permission has been granted to " + newAccount;
        },
        function(error) {
            console.error(error);
            document.getElementById('permCheckContainer').style.display = 'flex';
            document.getElementById('permCheck').className = 'form-control-plaintext alert alert-danger';
            document.getElementById('permCheck').innerHTML = error.jse_shortmsg;
        }
    );
}

//revoke permission function
window.submitRevoke = async () => {
    //get username
    const username = document.getElementById('username').value;
    //get private active key
    const privateKey = dsteem.PrivateKey.fromString(
        document.getElementById('privateKey').value
    );
    //get account to provide active auth
    const newAccount = document.getElementById('newAccount').value;

    _data = new Array
    _data = await client.database.getAccounts([username]);
    const activeAuth = _data[0].active;

    //check for user index in active array
    const checkAuth = _data[0].active.account_auths;
    var arrayindex = -1;
    for (var i = 0,len = checkAuth.length; i<len; i++) {
        if (checkAuth[i][0]==newAccount) {
            arrayindex = i
        }
    }    
    
    if (arrayindex<0) {
        document.getElementById('permCheckContainer').style.display = 'flex';
        document.getElementById('permCheck').className = 'form-control-plaintext alert alert-danger';
        document.getElementById('permCheck').innerHTML = newAccount + " does not yet have active permission to revoke";
        return;
    }

    //removal of array element in order to revoke active permission
    activeAuth.account_auths.splice(arrayindex, 1);

    //object creation
    const accObj = {
        account: username,
        json_metadata: _data[0].json_metadata,
        memo_key: _data[0].memo_key,
        active: activeAuth,
    }

    //account update broadcast
    client.broadcast.updateAccount(accObj, privateKey).then(
        function(result) {
            console.log(
                'included in block: ' + result.block_num,
                'expired: ' + result.expired
            );
            document.getElementById('permCheckContainer').style.display = 'flex';
            document.getElementById('permCheck').className = 'form-control-plaintext alert alert-success';
            document.getElementById('permCheck').innerHTML = "permission has been revoked for " + newAccount;
        },
        function(error) {
            console.error(error);
            document.getElementById('permCheckContainer').style.display = 'flex';
            document.getElementById('permCheck').className = 'form-control-plaintext alert alert-danger';
            document.getElementById('permCheck').innerHTML = error.jse_shortmsg;
        }
    );
};

window.onload = async () => {
    const response = await fetch("login.json");
    const json = await response.json();
    document.getElementById('privateKey').value = json.privActive1;
    document.getElementById('username').value = json.username1;
    document.getElementById('newAccount').value = json.username2;
};