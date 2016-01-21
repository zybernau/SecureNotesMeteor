Notes = new Mongo.Collection('notes');

if (Meteor.isClient) {
    
    //option for signup.
    Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
  
  // Angular module definition.
  angular.module('SecureNotes',['angular-meteor', 'accounts.ui']);
  
  angular.module('SecureNotes'). controller('NotesCtrlr', ['$scope', '$meteor', 
  function($scope, $meteor) {
        
        $scope.$meteorSubscribe('notes');
        
        // get all the notes.
        $scope.notes = $meteor.collection( 
        function() {
            return Notes.find($scope.getReactively('query'), {sort: {createdAt: -1}})
        });
        
        // get the query. if there are any phrase in the search box please include so.
        $scope.$watch('searchText', function() {
            if ($scope.searchText && $scope.searchText.length > 2)
            {
                var stext = $scope.searchText.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
                var search = new RegExp(stext, 'i');
                
                //console.log('search text is :' + stext );
                $scope.query = { noteText: search };
            }
            else
            {
                $scope.query = {};
            }
        });
        
        // scope utility - count
        $scope.unCompletedtasks = function () {
          return Notes.find({ checked: {$ne: true} }).count();
        };
        
        // Scope CRUD.
        $scope.addNote = function (newNote) {
            $meteor.call('addNote', newNote);
        };
        $scope.deleteNote = function (note) {
          $meteor.call('deleteNote', note);
        };  
          
      
  }])
  
}

Meteor.methods(
    {
        
        addNote: function(newNote) {
            if (! Meteor.userId()) {
                throw new Meteor.Error('not-authorized');
            }
            
            // add some for secure. encrypt it. damn it.
            Notes.insert( {
                note: newNote,
                noteText: newNote,
                owner: Meteor.userId(),
                username: Meteor.user().username,
                createdAt: new Date()
            });
            
        },
        
        deleteNote: function(note) {
            //console.log(" " + Meteor.user().username + "_" + note.username);
            if(Meteor.user().username == note.username)
            {
                Notes.remove(note._id);
            }
            // else show some error message. toaster.
            // TODO
        } 
    }
);

if (Meteor.isServer) {
  Meteor.publish('notes', function () {
    return Notes.find();
  });
}