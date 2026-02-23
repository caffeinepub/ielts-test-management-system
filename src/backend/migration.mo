import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Storage "blob-storage/Storage";

module {
  type TestType = {
    #listening;
    #reading;
    #writing;
    #mixed;
  };

  type QuestionType = {
    #multipleChoice;
    #trueFalseNotGiven;
    #shortAnswer;
    #matching;
    #sentenceCompletion;
    #longAnswer;
  };

  type Media = {
    mediaType : { #image; #audio };
    blob : Storage.ExternalBlob;
    description : Text;
  };

  type Question = {
    id : Nat;
    text : Text;
    questionType : QuestionType;
    options : [Text];
    correctAnswer : Text;
    marks : Nat;
    media : ?Media;
  };

  type Test = {
    id : Nat;
    title : Text;
    testType : TestType;
    instructions : Text;
    questions : [Question];
  };

  type Answer = {
    questionId : Nat;
    answer : Text;
  };

  type StudentResponse = {
    id : Nat;
    studentName : Text;
    batchNumber : Text;
    testId : Nat;
    submissionTimestamp : Int;
    answers : [Answer];
    totalScore : Nat;
    totalCorrect : Nat;
    totalWrong : Nat;
    estimatedBand : Float;
    timeTaken : Nat;
  };

  // Define the old persistent actor = new persistent actor
  type Actor = {
    tests : Map.Map<Nat, Test>;
    responses : Map.Map<Nat, StudentResponse>;
  };

  public func run(old : Actor) : Actor { old };
};
