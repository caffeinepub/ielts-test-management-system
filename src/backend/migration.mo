import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";

module {
  // Old Question type without media field
  type OldQuestion = {
    id : Nat;
    text : Text;
    questionType : {
      #multipleChoice;
      #trueFalseNotGiven;
      #shortAnswer;
      #matching;
      #sentenceCompletion;
      #longAnswer;
    };
    options : [Text];
    correctAnswer : Text;
    marks : Nat;
  };

  // Old Test type with old Question
  type OldTest = {
    id : Nat;
    title : Text;
    testType : {
      #listening;
      #reading;
      #writing;
      #mixed;
    };
    instructions : Text;
    questions : [OldQuestion];
  };

  // Old Actor type with old persistent storage
  type OldActor = {
    tests : Map.Map<Nat, OldTest>;
    responses : Map.Map<Nat, {
      id : Nat;
      studentName : Text;
      batchNumber : Text;
      testId : Nat;
      submissionTimestamp : Int;
      answers : [{
        questionId : Nat;
        answer : Text;
      }];
      totalScore : Nat;
      totalCorrect : Nat;
      totalWrong : Nat;
      estimatedBand : Float;
      timeTaken : Nat;
    }>;
  };

  // New Question type with media field
  type NewQuestion = {
    id : Nat;
    text : Text;
    questionType : {
      #multipleChoice;
      #trueFalseNotGiven;
      #shortAnswer;
      #matching;
      #sentenceCompletion;
      #longAnswer;
    };
    options : [Text];
    correctAnswer : Text;
    marks : Nat;
    media : ?{
      mediaType : { #image; #audio };
      blob : Storage.ExternalBlob;
      description : Text;
    };
  };

  // New Test type with new Question
  type NewTest = {
    id : Nat;
    title : Text;
    testType : {
      #listening;
      #reading;
      #writing;
      #mixed;
    };
    instructions : Text;
    questions : [NewQuestion];
  };

  // New Actor type with new persistent storage
  type NewActor = {
    tests : Map.Map<Nat, NewTest>;
    responses : Map.Map<Nat, {
      id : Nat;
      studentName : Text;
      batchNumber : Text;
      testId : Nat;
      submissionTimestamp : Int;
      answers : [{
        questionId : Nat;
        answer : Text;
      }];
      totalScore : Nat;
      totalCorrect : Nat;
      totalWrong : Nat;
      estimatedBand : Float;
      timeTaken : Nat;
    }>;
  };

  // Migration function called by the main actor via the with-clause
  public func run(old : OldActor) : NewActor {
    // Transform old tests to new tests with media field set to null
    let newTests = old.tests.map<Nat, OldTest, NewTest>(
      func(_id, oldTest) {
        {
          oldTest with
          questions = oldTest.questions.map(
            func(oldQuestion) {
              {
                oldQuestion with
                media = null; // Set media field to null for old questions
              };
            }
          )
        };
      }
    );
    { old with tests = newTests };
  };
};

