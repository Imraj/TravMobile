
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'


var base = "http://localhost/travoapi";
//var base = "https://trav.com.ng/travapi";

angular.module('starter', ['ionic','ionic-datepicker','templates','ngStorage','ngCordova','ion-autocomplete'])

.run(['$ionicPlatform', '$rootScope', '$state', function($ionicPlatform,$rootScope,$state) {
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

   if(!angular.isDefined($rootScope.isAuthenticated) && window.localStorage.isAuthenticated){
        // User exist
                       $rootScope.userId = window.localStorage.userId; 
                       $rootScope.isAuthenticated = window.localStorage.isAuthenticated;
                       $rootScope.fullName = window.localStorage.fullName;
                       $rootScope.emailAddress = window.localStorage.emailAddress;
                       $rootScope.phoneNumber = window.localStorage.phoneNumber;
                       $rootScope.kinName = window.localStorage.kinName;
                       $rootScope.kinPhoneNumber = window.localStorage.kinPhoneNumber;
                       $rootScope.mobileToken = window.localStorage.mobileToken;
                       
    }else if(!angular.isDefined($rootScope.isAuthenticated) && !window.localStorage.isAuthenticated){
        // User is not logged at all. Send him back to login page
        $state.go("app.login");
    }

}])

.controller("HomeCtrl",["TravelFactory","$state","$location","$scope","$ionicLoading","$timeout","ionicDatePicker",
                    function(TravelFactory,$state,$location,$scope,$ionicLoading,$timeout,ionicDatePicker){



  $scope.travel = {
    location : '',
    destination : '',
    date :'',
  }

  $scope.openDatePicker = function(val){
    var ipObj1 = {
        callback: function (val) {  //Mandatory

          var date = new Date(val);

          var year = date.getFullYear();
          var month = date.getMonth() + 1;
          var day = date.getDate();

          $scope.travel.date = year+'-'+month+'-'+day;
        },
        from:new Date(),
        inputDate: new Date(),      //Optional
        mondayFirst: true,          //Optional
        closeOnSelect: true,       //Optional
        templateType: 'modal'
    };

      ionicDatePicker.openDatePicker(ipObj1);
    };

    TravelFactory.getPlaces()
                 .success(function(data){
                  
                   $scope.all_places = data;
                 })
                 .error(function(err,statusCode){

                 });

  $scope.callBackMtd = function(query,isInitializing){

    return TravelFactory.getPlaces();

   
  }

  $scope.travelSearch = function(location,destination,date){
     $ionicLoading.show({template:"Loading... Please wait "});
      $state.go("app.result",{loc:location,
                              destination:destination,
                              date:date
                            });
      }

}])



.controller("ResultCtrl",["$state","$scope","TravelFactory","$ionicLoading","$timeout","$ionicPopup",function($state,$scope,TravelFactory,$ionicLoading,$timeout,$ionicPopup){

  $scope.travel = {
    location : '',
    destination : '',
    date :'',
  }

  var loc = $state.params.loc;
  var destination = $state.params.destination;
  var date = $state.params.date;

  $scope.loc = loc;
  $scope.destination = destination;
  $scope.date = date;

  TravelFactory.getResult(loc,destination,date)
                  .success(function(data){
                      $ionicLoading.hide();
                      $scope.results = data;
                      
                      console.log($scope.results);

                  })
                  .error(function(data,header,statusCode,config){
                      
                      $ionicLoading.show({template:"An error occured : " + data + header + " | " + statusCode});
                      $timeout(function(){
                        $ionicLoading.hide();
                      },3000);

                  });

    TravelFactory.getSuggestedResult(loc,destination,date)
                                     .success(function(data){
                                        $scope.suggested_results = data; 
                                     })
                                     .error(function(err,statusCode){
                                        $ionicPopup.alert({title:"err",template:"s : " + err + statusCode});
                                     });

        var travelId = $state.params.aId;
       
        $ionicLoading.show({template:"Fetching Details... Please wait"});
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

}])

.controller("PayCtrl",["TravelFactory","$state","$location","$scope","$ionicLoading","$timeout","$rootScope","$ionicPopup",
                    function(TravelFactory,$state,$location,$scope,$ionicLoading,$timeout,$rootScope,$ionicPopup){

                      $scope.travelSearch = function(location,destination,date){
                         $ionicLoading.show({template:"Loading... Please wait "});
                        
                         TravelFactory.getResult(location,destination,date)
                                      .success(function(data){
                                          $ionicLoading.hide();
                                          $scope.results = data;
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

                      $scope.cardDetails = {};

                      var userId = $rootScope.userId;

                      $scope.openPaymentForm = function(){
                        $state.go("app.payform",{userId:userId,travelplanId:travelId});
                      }

                      $scope.pay = function(){
                        $ionicLoading.show({template:"Processing Payment..."});
                         
                        window.PaystackPlugin.getToken(
                            function(resp) {
                              // A valid one-timme-use token is obtained, do your thang!
                              var token = resp["token"];
                              var user_id = $state.params.userId;
                              var travelplan_id = $state.params.travelplanId;
                              var email = $rootScope.emailAddress;
                              TravelFactory.paystack(token,travelplan_id,user_id,email)
                                            .success(function(data){
                                              $ionicLoading.hide();
                                              $ionicPopup.alert({title:"Payment success " + data["message"],template:"data:"+data });
                                              
                                              //if(data["status"] == true){
                                                  $state.go("app.ticket",{token:token});
                                              //}

                                            })
                                            .error(function(err,statusCode){
                                                $ionicLoading.hide(); 
                                               $ionicPopup.alert({title:"Payment failure",template:"err:"+err+" | statusCode : " + statusCode})
                                            })
                              
                            },
                            function(resp) {
                              // Something went wrong, oops - perhaps an invalid card.
                              $ionicLoading.hide();
                              $ionicPopup.alert({title:"paystack failure",template:'error: '+resp["error"] + " | code:"+resp["code"]});
                            },
                            $scope.cardDetails.cardNumber,
                            $scope.cardDetails.expMonth,
                            $scope.cardDetails.expYear,
                            $scope.cardDetails.cvv);   
                      }
}])

.controller("LoginCtrl",["$scope","$ionicLoading","TravelFactory","$timeout","$rootScope","$location","$localStorage","$state","$ionicViewService","$ionicPopup",
                         function($scope,$ionicLoading,TravelFactory,$timeout,$rootScope,$location,$localStorage,$state,$ionicViewService,$ionicPopup){

  $scope.loginData ={
    fullname:'',
    emailAddress:'',
    phoneNumber:'',
    password:''
  }

  $scope.openRegisterView = function(){
    $state.go("app.register");
  }

  $scope.showForgotPassword = function(){
    $ionicPopup.alert({title:"Forgot Password?",template:"Visit trav.com.ng/retrieve/password Or Click <a href='https://trav.com.ng/retrieve/password'>here</a>"});
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
                    if(data["status"] == "failed")
                    {
                       $ionicLoading.show({template:"Invalid Login Details"});
                       $timeout(function(){
                         $ionicLoading.hide();
                       },3000);

                    }
                    else{

                       window.localStorage.isAuthenticated = true;
                       window.localStorage.userId = data['id'];
                      
                       window.localStorage.fullName = data['fullName'];
                       window.localStorage.emailAddress = data['emailAddress'];
                       window.localStorage.phoneNumber = data['phoneNumber'];
                       window.localStorage.kinName = data['next_of_kin_name'];
                       window.localStorage.kinPhoneNumber = data['next_of_kin_phoneNo'];
                       window.localStorage.mobileToken = data["mobileToken"];

                       $rootScope.userId = window.localStorage.userId;
                       $rootScope.isAuthenticated = window.localStorage.isAuthenticated;
                       $rootScope.fullName = window.localStorage.fullName;
                       $rootScope.emailAddress = window.localStorage.emailAddress;
                       $rootScope.phoneNumber = window.localStorage.phoneNumber;
                       $rootScope.kinName = window.localStorage.kinName;
                       $rootScope.kinPhoneNumber = window.localStorage.kinPhoneNumber;
                       $rootScope.mobileToken = window.localStorage.mobileToken;

                       $state.go('app.home');

                    }
                 })
                 .error(function(err,statusCode){
                 
                  $ionicLoading.show({title:"",template:"Error Occured Logging In.. Please try again : " + err + statusCode});
                   $timeout(function(){
                     $ionicLoading.hide();
                   },5000);
                 });
  }

  $rootScope.Logout = function()
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

.controller("RegisterCtrl",["$scope","$ionicLoading","TravelFactory","$timeout","$state",function($scope,$ionicLoading,TravelFactory,$timeout,$state){
  $scope.loginData ={
    fullname:'',
    emailAddress:'',
    phoneNumber:'',
    password:'',
    cpassword:''
  }

  $scope.openLoginView = function(){
    $state.go("app.login");
  }

  $scope.Register = function($fullname,$email,$phone,$password,$cpassword){
      $ionicLoading.show({template:"Creating your account ... Please wait"});
      TravelFactory.registerUser($fullname,$email,$phone,$password,$cpassword)
                   .success(function(data){
                     $ionicLoading.hide();
                     if(data["status"]){
                         $ionicLoading.show({template:data["message"]});
                         $timeout(function(){
                            $ionicLoading.hide();
                            if(data["status"] == "success")
                            {
                                $ionicPopup.alert({title:"Account ",template:"Account Created Successfully ! Login To Continue"})
                                  .then(function(res){
                                    $state.go("app.login");
                                  });
                            }
                         },5000);
                         
                     }
                   })
                   .error(function(err,statusCode){
                       $ionicLoading.show({template:"Error Occured Creating your account.. Please try again"});
                       $timeout(function(){
                         $ionicLoading.hide();
                       },3000);
                   });
  }
}])

.controller("TicketCtrl",["$scope","$ionicPopup","$timeout","$ionicLoading","$ionicHistory","TravelFactory","$rootScope","$state",function($scope,$ionicPopup,$timeout,$ionicLoading,$ionicHistory,TravelFactory,$rootScope,$state){

     $ionicLoading.show();
    var token = $state.params.token;
   
    TravelFactory.getTicket(token)
                 .success(function(data){
                    console.log("Tik data : " + data);
                    $scope.ticket = data;
                     $ionicLoading.hide();
                   
                 })
                 .error(function(err,statusCode){
                       $ionicLoading.hide();
                      $ionicPopup.alert({title:"Ticket : " + token + " Error",template:"An error occured"});
                 });



}])

.controller("TicketsCtrl",["$scope","$ionicPopup","$timeout","$ionicLoading","$ionicHistory","TravelFactory","$rootScope","$state",function($scope,$ionicPopup,$timeout,$ionicLoading,$ionicHistory,TravelFactory,$rootScope,$state){

    $ionicLoading.show();
    var userId = $rootScope.userId;
    TravelFactory.getTickets(userId)
                 .success(function(data){
                   
                    $ionicLoading.hide();
                    $scope.tickets = data;
                    
                 })
                 .error(function(err,statusCode){
                     $ionicLoading.hide();
                    $ionicPopup.alert({title:"Tickets : Error",template:"An error occured"});
                  
                 });


}])

.controller("ProfileCtrl",["$scope","$state","TravelFactory","$ionicLoading","$timeout",function($scope,$state,TravelFactory,$ionicLoading,$timeout){

    $scope.profile = {
      fullname:$scope.fullName,
      email:$scope.emailAddress,
      phone:$scope.phoneNumber,
      kin_name:$scope.kinName,
      kin_phone:$scope.kinPhoneNumber
    }
  

    $scope.editProfile = function(){
      $state.go("app.editprofile");
     
    }

    $scope.saveProfile = function(){

      $ionicLoading.show({ template : "Updating profile" });
      var fullname = $scope.profile.fullname;
      var email = $scope.profile.email;
      var phone = $scope.profile.phone;
      var kin_name = $scope.profile.kin_name;
      var kin_phone = $scope.profile.kin_phone;
      var userId = $scope.userId;

     
      TravelFactory.updateProfile(fullname,email,phone,kin_name,kin_phone,userId)
                   .success(function(data){
                      $ionicLoading.hide();
                      
                       
                      //if(data["status"] == "success"){
                      
                        $ionicLoading.show({template:"Profile updated successfully"});

                        $timeout(function(){
                           $ionicLoading.hide();
                           $state.go("app.login"); 
                        },3000);
                       
                      //}

                   })
                   .error(function(err,statusCode){
                      $ionicLoading.hide();

                      $ionicLoading.show({template:"Error while updating profile"});
                       $timeout(function(){
                         $ionicLoading.hide();
                       },3000);
                   });

    }

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

  
  }

}])


.config(['$stateProvider', '$urlRouterProvider', 'ionicDatePickerProvider', '$httpProvider', function($stateProvider, $urlRouterProvider,ionicDatePickerProvider,$httpProvider) {

  var datePickerObj = {
      inputDate: new Date(),
      setLabel: 'Set',
      todayLabel: 'Today',
      closeLabel: 'Close',
      mondayFirst: false,
      weeksList: ["S", "M", "T", "W", "T", "F", "S"],
      monthsList: ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"],
      templateType: 'modal',
      from: new Date(),
      to: new Date(2018, 8, 1),
      showTodayButton: true,
      dateFormat: 'dd MMM yyyy',
      closeOnSelect: true,
    };
  ionicDatePickerProvider.configDatePicker(datePickerObj);

  $stateProvider
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'menu.html',
    controller:"LogoutCtrl"
  })
  .state('app.home', {
      url: '/home',
      views: {
        'menuContent': {
          templateUrl: 'home.html',
          controller: 'HomeCtrl'
        }
      }
    })

    .state('app.book',{
      url:'/book/:aId',
      views:{
        'menuContent':{
          templateUrl: 'book.html',
          controller:'ResultCtrl'
        }
      }
    })

    .state('app.pay',{
      url:'/pay/:aId',
      views:{
        'menuContent':{
          templateUrl: 'pay.html',
          controller:'PayCtrl'
        }
      }
    })

     .state('app.payform',{
      url:'/payform/:userId/:travelplanId',
      views:{
        'menuContent':{
          templateUrl: 'payform.html',
          controller:'PayCtrl'
        }
      }
    })    

    .state('app.result', {
        url: '/result/:loc/:destination/:date',
        views: {
          'menuContent': {
            templateUrl: 'result.html',
            controller: 'ResultCtrl',
           }
        },
       
      })
    
    .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'login.html',
          controller: 'LoginCtrl'
        }
      }
    })

    .state('app.register', {
      url: '/register',
      views: {
        'menuContent': {
          templateUrl: 'register.html',
          controller: 'RegisterCtrl'
        }
      }
    })

  .state('app.contact', {
    url: '/contact',
    views: {
      'menuContent': {
        templateUrl: 'contact.html',
        
      }
    }
  })

  .state('app.help', {
    url: '/help',
    views: {
      'menuContent': {
        templateUrl: 'help.html',
        
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

   .state('app.editprofile', {
    url: '/editprofile',
    views: {
      'menuContent': {
        templateUrl: 'editprofile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('app.tickets',{
    url:'/tickets',
    views:{
      'menuContent':{
        templateUrl:'tickets.html',
        controller : 'TicketsCtrl'
      }
    }
  })

  .state('app.ticket',{
    url:"/ticket/:token",
    views:{
      'menuContent':{
        templateUrl:"ticket.html",
        controller:"TicketCtrl"
      }
    }
  })


  .state('app.transaction', {
    url: '/transaction',
    views: {
      'menuContent': {
        templateUrl: 'transaction.html',
        controller: 'TransactionCtrl'
      }
    }
  })

  .state('app.success',{
    url: '/success',
    views:{
      'menuContent':{
        templateUrl: 'transactions/success.html',
        controller:'TicketCtrl'
      }
    }
  })

  .state('app.failed',{
    url: '/failed/:transaction_id',
    views:{
      'menuContent':{
        templateUrl: 'transactions/failed.html',
        controller:''
      }
    }
  });


  $httpProvider.defaults.headers.common = {};
  $httpProvider.defaults.headers.post = {};
  $httpProvider.defaults.headers.put = {};
  $httpProvider.defaults.headers.patch = {};


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/login');
}])

.factory("TravelFactory",["$http","$rootScope",function($http,$rootScope){
    var TravelAPI = {
      getResult : function(location,destination,date){
        var link = base+"/search.php";
        return $http.get(link+"?location="+location+"&&destination="+destination+"&&date="+date+"&&mobileToken="+$rootScope.mobileToken);
      },

      getDetails : function(travelId){
        var link = base+"/details.php";
        return $http.get(link+"?travelId="+travelId+"&&mobileToken="+$rootScope.mobileToken);
      },

      getTransactions : function(){
        var link = base+"/get_transactions.php";
        return  $http.post(link);
      },

      loginUser : function(phoneNumber,password){
        var lbase = "http://trav.dev/login_api";
        //var lbase = "https://trav.com.ng/home/login_api";
        return $http.get(lbase+"/"+phoneNumber+"/"+password);
      },

      registerUser :function(fullname,email,phoneNo,password,cpassword){
        var rbase = "http://trav.dev/register_api"
        //var rbase = "https://trav.com.ng/home/register_api";
        return $http.get(rbase+"?fullname="+fullname+"&&email="+email+"&&phoneNo="+phoneNo+"&&password="+password+"&&cpassword="+cpassword);
      },

      getTickets : function(userId){
        var link = base+"/get_tickets.php";
        var userId = userId;
        return $http.get(link+"?userId="+userId+"&&mobileToken="+$rootScope.mobileToken);
      },

      getTicket:function(token){
        var link = base+"/get_ticket.php";
        var token =token;
        return $http.get(link+"?token="+token+"&&mobileToken="+$rootScope.mobileToken);
      },

      getSuggestedResult : function(location,destination,date){
         var link = base+"/suggestion.php";
         return $http.get(link+"?location="+location+"&&destination="+destination+"&&date="+date+"&&mobileToken="+$rootScope.mobileToken);
      },

      pay:function(location,destination,agency,email_address,phone_number,price,fullname,token,travelplan_id,user_id){
        var link = base+"/pay.php";
        var userId = $rootScope.userId;
        return $http.post(link,{location:location,destination:destination,agency:agency,email_address:email_address,
                                phone_number:phone_number,price:price,fullname:fullname,token:token,
                                travelplan_id:travelplan_id,user_id:userId
        });

      },

      getPlaces:function(){
        var link =  base+"/all_places.php";
        return $http.get(link+"?mobileToken="+$rootScope.mobileToken);
      },

      updateProfile:function(fullname,email,phone,kin_name,kin_phone,userId){
          var link = base+"/update_profile.php";
          return $http.get(link+"?fullname="+fullname+"&&email="+email+"&&phone="+phone+"&&kin_name="+kin_name+"&&kin_phone="+kin_phone+"&&userId="+userId+"&&mobileToken="+$rootScope.mobileToken);
          
      },

      paystack:function(token,travelplan_id,user_id,email_address){
        var link = base+"/paystack.php";
        return $http.get(link+"?token="+token+"&&travelplan_id="+travelplan_id+"&&user_id="+user_id+"&&email="+email_address+"&&mobileToken="+$rootScope.mobileToken);
      }


    }

    return TravelAPI;
}]);
