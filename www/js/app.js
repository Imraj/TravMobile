// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js

var base = "http://localhost:90/TravoAPI";
var mbase = "http://travoapi.azurewebsites.net/";

angular.module('starter', ['ionic','ionic-datepicker','ngStorage','ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.controller("HomeCtrl",["TravelFactory","$state","$location","$scope","$ionicLoading","$timeout","ionicDatePicker","$cordovaInAppBrowser",
                    function(TravelFactory,$state,$location,$scope,$ionicLoading,$timeout,ionicDatePicker,$cordovaInAppBrowser){



  $scope.travel = {
    location : '',
    destination : '',
    date :'',
    seats:''
  }

  $scope.openDatePicker = function(val){
    var ipObj1 = {
        callback: function (val) {  //Mandatory

          var date = new Date(val);

          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var day = date.getDate();

          $scope.travel.date = year+'-'+month+'-'+day;

          console.log('Return value from the datepicker popup is : ' + year+'-'+month+'-'+day);
        },
        inputDate: new Date(),      //Optional
        mondayFirst: true,          //Optional
        closeOnSelect: false,       //Optional
        templateType: 'modal'
    };

      ionicDatePicker.openDatePicker(ipObj1);
    };



  $scope.callBackMtd = function(query,isInitializing){
    return[{"id":1,"value":"Ogbomoso"},
          {"id":2,"value":"Port-Harcourt"},
          {"id":3,"value":"Ikeja"},
          {"id":4,"value":"Ibadan"},
          {"id":5,"value":"Enugu"}]
  }

  $scope.travelSearch = function(location,destination,date){
     $ionicLoading.show({template:"Loading... Please wait "});
     TravelFactory.getResult(location,destination,date)
                  .success(function(data){
                      $ionicLoading.hide();
                      $scope.results = data;
                      //console.log("Num Of Results : "+$scope.results.length);
                      //$state.go('app.result');
                      console.log($scope.results);
                      if($scope.results.length == 0)
                      {
                          TravelFactory.getSuggestedResult(location,destination,date)
                                     .success(function(data){

                                     })
                                     .error(function(data){

                                     });
                       }

                  })
                  .error(function(err,statusCode){
                      $ionicLoading.show({template:"An error occured in search"});
                      $timeout(function(){
                        $ionicLoading.hide();
                      },3000);

                  });

        $ionicLoading.hide();
  }


  var travelId = $state.params.aId;
  $ionicLoading.show({template:"Fetching Details... Please wait"})
  TravelFactory.getDetails(travelId)
                   .success(function(data){
                      $ionicLoading.hide();
                      $scope.result = data;
                   })
                   .error(function(err,statusCode){
                     $ionicLoading.show({template:"Error fetching data"});
                     $timeout(function(){
                       $ionicLoading.hide();
                     },3000);

                   });

          var options = {
            location:'yes',
            clearcache:'yes',
            toolbar:'yes'
          };

          $scope.openBrowser = function(){
              $cordovaInAppBrowser.open('https://google.com',options)
              .then(function(event){
                alert("successfully opened : " + event);
              })
              .catch(function(event){
                alert("Err : " + event);
              });
          }

}])

.controller("PayCtrl",["TravelFactory","$state","$location","$scope","$ionicLoading","$timeout",
                    function(TravelFactory,$state,$location,$scope,$ionicLoading,$timeout){

                      $scope.travelSearch = function(location,destination,date){
                         $ionicLoading.show({template:"Loading... Please wait "});
                         TravelFactory.getResult(location,destination,date)
                                      .success(function(data){
                                          $ionicLoading.hide();
                                          $scope.results = data;
                                          console.log("Num Of Results : "+$scope.results.length);
                                          if($scope.results.length){

                                            TravelFactory.getSuggestedResult(location,destination,date)
                                                         .success(function(data){

                                                         })
                                                         .error(function(data){

                                                         });
                                          }

                                      })
                                      .error(function(err,statusCode){
                                          $ionicLoading.show({template:"An error occured in search"});
                                          $timeout(function(){
                                            $ionicLoading.hide();
                                          },3000);

                                      });

                            $ionicLoading.hide();
                      }

                      var travelId = $state.params.aId;
                      //$ionicLoading.show({template:"Fetching Details... Please wait"})
                      TravelFactory.getDetails(travelId)
                                       .success(function(data){
                                          $ionicLoading.hide();
                                          $scope.result = data;
                                       })
                                       .error(function(err,statusCode){
                                         $ionicLoading.show({template:"Error fetching data"});
                                         $timeout(function(){
                                           $ionicLoading.hide();
                                         },3000);

                                       });

                      var handler = SimplePay.configure({
                                     token: processPayment, // callback function to be called after token is received
                                     key: 'test_pu_demo', // place your api key. Demo: test_pu_*. Live: pu_*
                                     image: 'http://' // optional: an url to an image of your choice
                                   });

                      function processPayment(token)
                      {
                          var location= "loc 1";//$("#ss-dd-location").html();
                        	var destination="loc 2";//$("#ss-dd-destination").html();
                        	var transaction_id = "1234TRID";
                        	var email_address = "email";//$("#ss-dd-emailAddress").html();
                        	var phone_number = "phone";//$("#ss-dd-phoneNumber").html();
                        	var price =  "price";//$("#ss-dd-price").html();
                        	var agency = "agency";//$("#ss-dd-agency").html();
                        	var fullname = "fullname";//$('#ss-dd-fullname').html();

                          var form = $('#checkout_form');

                          form.append(
                             $('<input />', { name: 'token', type: 'hidden', value: token })
                        	);
                        	form.append(
                        		$('<input />',{name:'location',type:'hidden',value:location})
                          );

                        	form.append(
                        		$('<input />',{name:'destination',type:'hidden',value:destination})
                          );

                        	form.append(
                        	 $('<input />',{name:'transaction_id',type:'hidden',value:transaction_id})
                          );

                        	form.append(
                        	 $('<input />',{name:'email_address',type:'hidden',value:email_address})
                        	);

                        	form.append(
                        		 $('<input />',{name:'phone_number',type:'hidden',value:phone_number})
                        	);
                        	form.append(
                        		 $('<input />',{name:'price',type:'hidden',value:price})
                        	);
                        	form.append(
                        		$('<input />',{name:'fullname',type:'hidden',value:fullname})
                        	);
                        	form.append(
                        		$('<input />',{name:'agency',type:'hidden',value:agency})
                        	);

                          form.submit();
                        console.log("process payment");
                      }

                      $scope.pay = function(event){
                          event.preventDefault();

                          handler.open(SimplePay.CHECKOUT, // type of payment
                          {
                            email:$scope.emailAddress,
                            phone:$scope.phoneNumber,
                            amount:$scope.result.price,
                            currency:'NGN',
                            description:$scope.result.agency + " Ticket ",
                            country:'NG',
                         });
                         console.log("pay handler");
                         return false;
                    }
}])

.controller("LoginCtrl",["$scope","$ionicLoading","TravelFactory","$timeout","$rootScope","$location","$localStorage","$state","$ionicViewService",
                         function($scope,$ionicLoading,TravelFactory,$timeout,$rootScope,$location,$localStorage,$state,$ionicViewService){

  $scope.loginData ={
    fullname:'',
    emailAddress:'',
    phoneNumber:'',
    password:''
  }

  $scope.Login = function(phone,password){
    $ionicLoading.show({template:"Logging In... Please wait"});
    $ionicViewService.nextViewOptions({
             disableAnimate: true,
             disableBack: true
  });

    TravelFactory.loginUser(phone,password)
                 .success(function(data){
                   $ionicLoading.hide();
                   $localStorage.isAuthenticated = true;
                   $localStorage.fullName = data['fullName'];
                   $localStorage.emailAddress = data['emailAddress'];
                   $localStorage.phoneNumber = data['phoneNumber'];
                   $localStorage.kinName = data['next_of_kin_name'];
                   $localStorage.kinPhoneNumber = data['next_of_kin_phoneNo'];
                   console.log("FullName is : " + $localStorage.fullName);
                   $rootScope.isAuthenticated = $localStorage.isAuthenticated;
                   $rootScope.fullName = $localStorage.fullName;
                   $rootScope.emailAddress = $localStorage.emailAddress;
                   $rootScope.phoneNumber = $localStorage.phoneNumber;
                   $rootScope.kinName = $localStorage.kinName;
                   $rootScope.kinPhoneNumber = $localStorage.kinPhoneNumber;

                   //$location.path("/home");
                   $state.go('app.home');
                 })
                 .error(function(err,statusCode){

                   $ionicLoading.show({template:"Error Occured Logging In.. Please try again"});
                   $timeout(function(){
                     $ionicLoading.hide();
                   },3000);
                 });
  }

  $scope.Logout = function()
  {
    $rootScope.isAuthenticated = "";
    $rootScope.fullName = "";
    $rootScope.emailAddress = "";
    $rootScope.phoneNumber = "";
    $rootScope.nextOfKinName = "";
    $rootScope.nextOfKinPhoneNumber = "";
    $state.go("app.login");

  }

}])

.controller("RegisterCtrl",["$scope","$ionicLoading","TravelFactory","$timeout",function($scope,$ionicLoading,TravelFactory,$timeout){
  $scope.loginData ={
    fullname:'',
    emailAddress:'',
    phoneNumber:'',
    password:''
  }

  $scope.Register = function($fullname,$email,$phone,$password){
      $ionicLoading.show({template:"Creating your account ... Please wait"});
      TravelFactory.registerUser($fullname,$email,$phone,$password)
                   .success(function(data){
                     $ionicLoading.hide();
                     $timeout(function(){
                       $ionicLoading.show(data["message"]);
                     },2000);
                   })
                   .error(function(err,statusCode){
                       $ionicLoading.show({template:"Error Occured Creating your account.. Please try again"});
                       $timeout(function(){
                         $ionicLoading.hide();
                       },3000);
                   });
  }
}])

.controller("TicketCtrl",["$scope","$ionicLoading","$ionicHistory",function($scope,$ionicLoading,$ionicHistory){




  $scope.tickets = [
    {transactionId:"##############",ticketId:"#############",from:"Ogbomoso",to:"Port-Harcourt",travelDate:"May 22,2016",purchasedOn:"May 19,2016"},
    {transactionId:"################",ticketId:"############",from:"Ikeja",to:"Enugu",travelDate:"March 3,2016",purchasedOn:"March 2,2016"},
    {transactionId:"################",ticketId:"############",from:"Ibadan",to:"Imo",travelDate:"March 13,2016",purchasedOn:"March 13,2016"}
    ]


}])

.controller("ProfileCtrl",["$scope","$ionicModal",function($scope,$ionicModal){

}])

.controller("LogoutCtrl",["$scope","$location","$state","$rootScope",function($scope,$location,$state,$rootScope){

  $scope.Logout = function(){
    $rootScope.isAuthenticated = "";
    $rootScope.fullName = "";
    $rootScope.emailAddress = "";
    $rootScope.phoneNumber = "";
    $rootScope.nextOfKinName = "";
    $rootScope.nextOfKinPhoneNumber = "";

    $state.go("app.login");

    //$location.path("#/app/login");
  }

}])

.controller("ProfileCtrl",["$scope","$ionicPopup","$ionicLoading","$location","TravelFactory",function($scope,$ionicPopup,$ionicLoading,$location,TravelFactory){


  $scope.editPhoneNumber = function()
  {
      $ionicPopup.prompt({
                title:'Phone Number',
                template:' ',
                inputType:'text',
                inputPlaceholder:"Enter Your New Phone Number"
      }).then(function(res){
            $ionicLoading.show();
            TravelFactory.updatePhoneNumber(res)
                .success(function(data){
                    $ionicPopup.alert({title:'New phone number : ' + res ,template:" Phone number successfully updated "});
                    $ionicLoading.hide();
                })
                .error(function(){
                    $ionicLoading.hide();
                    $ionicPopup.alert({title:' ',template:" An Error Occured "});
                })
    })
  }

  $scope.editEmailAddress = function()
  {
      $ionicPopup.prompt({
              title:'Email Address',
              template:' ',
              inputType:'text',
              inputPlaceholder:"Enter Your New Email Address"
        }).then(function(res){
          $ionicLoading.show();
          TravelFactory.updateEmailAddress(res)
              .success(function(data){
                  $ionicPopup.alert({title:'New email address : ' + res ,template:" Email address successfully updated "});
                  $ionicLoading.hide();
              })
              .error(function(){
                  $ionicLoading.hide();
                  $ionicPopup.alert({title:' ',template:" An Error Occured "});
              })
  })
  }

  $scope.resetPassword = function()
  {
    $location.path("#/app/resetpassword");
  }

  $scope.addNextOfKin = function()
  {
    $location.path("#/app/nextofkin");
  }

}])

.controller("ResetPasswordCtrl",["$scope",function($scope){

}])

.controller("KinCtrl",["$scope",function($scope){

}])

.config(function($stateProvider, $urlRouterProvider,ionicDatePickerProvider) {

  var datePickerObj = {
      inputDate: new Date(),
      setLabel: 'Set',
      todayLabel: 'Today',
      closeLabel: 'Close',
      mondayFirst: false,
      weeksList: ["S", "M", "T", "W", "T", "F", "S"],
      monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      templateType: 'modal',
      from: new Date(2012, 8, 1),
      to: new Date(2018, 8, 1),
      showTodayButton: true,
      dateFormat: 'dd MMM yyyy',
      closeOnSelect: false,
    };
  ionicDatePickerProvider.configDatePicker(datePickerObj);

  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',

  })
  .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

    .state('app.book',{
      url:'/book/:aId',
      views:{
        'menuContent':{
          templateUrl: 'templates/book.html',
          controller:'HomeCtrl'
        }
      }
    })

    .state('app.pay',{
      url:'/pay/:aId',
      views:{
        'menuContent':{
          templateUrl: 'templates/pay.html',
          controller:'PayCtrl'
        }
      }
    })


    .state('app.result', {
        url: '/result',
        views: {
          'menuContent': {
            templateUrl: 'templates/result.html',
            controller: 'HomeCtrl'
          }
        }
      })


    .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html',

        }
      }
    })

    .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('app.register', {
      url: '/register',
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })

  .state('app.contact', {
    url: '/contact',
    views: {
      'menuContent': {
        templateUrl: 'templates/contact.html',
        controller: 'ContactCtrl'
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('app.tickets',{
    url:'/tickets',
    views:{
      'menuContent':{
        templateUrl:'templates/tickets.html',
        controller : 'TicketCtrl'
      }
    }
  })

  .state('app.resetpassword',{
    url:'/resetpassword',
    views:{
      'menuContent':{
        templateUrl:'templates/resetpassword.html',
        controller : 'ProfileCtrl'
      }
    }
  })

  .state('app.nextofkin',{
    url:'/nextofkin',
    views:{
      'menuContent':{
        templateUrl:'templates/nextofkin.html',
        controller : 'ProfileCtrl'
      }
    }
  })


  .state('app.transaction', {
    url: '/transaction',
    views: {
      'menuContent': {
        templateUrl: 'templates/transaction.html',
        controller: 'TransactionCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
})

.factory("TravelFactory",["$http",function($http){
    var TravelAPI = {
      getResult : function(location,destination,date){
        return $http.get(mbase+"/search.php?location="+location+"&&destination="+destination+"&&date="+date);
      },

      getDetails : function(travelId){
        return $http.get(mbase+"/details.php?travelId="+travelId);
      },

      getTransactions : function(){
        return  $http.get(mbase+"/get_transactions.php");
      },

      loginUser : function(phoneNo,password){
        var lbase = "http://trav.dev:90/login_api/";
        var mlbase = "http://travo.azurewebsites.net/login_api/";
        return $http.get(mlbase+phoneNo+"/"+password);
      },

      registerUser :function(fullname,email,phoneNo,password){
        var rbase = "http://trav.dev:90/register_api/";
        var mrbase = "http://travo.azurewebsites.net/register_api/";
        return $http.get(mrbase+fullname+"/"+email+"/"+phoneNo+"/"+password);
      },

      getTickets : function(userId){
        return $http.get(mbase+"/get_tickets.php?userId="+userId);
      },

      getSuggestedResult : function(location,destination,date){
        return $http.get(mbase+"/suggestion.php?location="+location+"&&destination="+destination+"&&date="+date);
      },



    }

    return TravelAPI;
}]);
