import Array "mo:core/Array";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";



actor {
  include MixinStorage();

  // Data models
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

  type Feedback = {
    text : Text;
    submittedBy : Text;
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
    feedback : ?Feedback;
  };

  type AuthCredentials = {
    username : Text;
    password : Text;
  };

  // Persistent storage using Map
  let tests = Map.empty<Nat, Test>();
  let responses = Map.empty<Nat, StudentResponse>();

  // Authentication function (updated credentials)
  func authenticateUser(creds : AuthCredentials) : Bool {
    creds.username == "Hexa's Beanibazar" and creds.password == "Hexas@12345";
  };

  // Test CRUD operations with authentication for create/update/delete
  public shared ({ caller }) func createTest(creds : AuthCredentials, test : Test) : async () {
    if (not authenticateUser(creds)) {
      Runtime.trap("Unauthorized: Invalid credentials");
    };
    tests.add(test.id, test);
  };

  public query ({ caller }) func getTest(id : Nat) : async ?Test {
    tests.get(id);
  };

  public query ({ caller }) func getAllTests() : async [Test] {
    tests.values().toArray();
  };

  public shared ({ caller }) func updateTest(creds : AuthCredentials, id : Nat, updatedTest : Test) : async () {
    if (not authenticateUser(creds)) {
      Runtime.trap("Unauthorized: Invalid credentials");
    };
    if (not tests.containsKey(id)) { Runtime.trap("Test not found") };
    tests.add(id, updatedTest);
  };

  public shared ({ caller }) func deleteTest(creds : AuthCredentials, id : Nat) : async () {
    if (not authenticateUser(creds)) {
      Runtime.trap("Unauthorized: Invalid credentials");
    };
    tests.remove(id);
    invalidateResponsesForTest(id);
  };

  // Student Response CRUD operations (no authentication required)
  public shared ({ caller }) func createStudentResponse(response : StudentResponse) : async () {
    responses.add(response.id, response);
  };

  public query ({ caller }) func getStudentResponse(id : Nat) : async ?StudentResponse {
    responses.get(id);
  };

  public query ({ caller }) func getAllStudentResponses() : async [StudentResponse] {
    responses.values().toArray();
  };

  public shared ({ caller }) func updateStudentResponse(id : Nat, updatedResponse : StudentResponse) : async () {
    if (not responses.containsKey(id)) { Runtime.trap("Response not found") };
    responses.add(id, updatedResponse);
  };

  public shared ({ caller }) func deleteStudentResponse(id : Nat) : async () {
    responses.remove(id);
  };

  // Automated scoring logic for supported question types
  func scoreResponse(testId : Nat, answers : [Answer]) : (Nat, Nat, Nat, Float) {
    let ?test = tests.get(testId) else { return (0, 0, 0, 0) };

    let scoringResults = answers.foldLeft((0, 0), func(acc, answer) {
      let (correct, wrong) = acc;
      let ?question = test.questions.find(func(q) { q.id == answer.questionId }) else { return (correct, wrong) };

      switch (question.questionType) {
        case (#multipleChoice or #trueFalseNotGiven or #shortAnswer or #matching or #sentenceCompletion) {
          if (Text.equal(answer.answer, question.correctAnswer)) {
            (correct + 1, wrong);
          } else {
            (correct, wrong + 1);
          };
        };
        case (#longAnswer) {
          (correct, wrong);
        };
      };
    });

    let (totalCorrect, totalWrong) = scoringResults;
    let totalScore = totalCorrect : Nat;

    // Band estimation logic
    func getBandEstimate(score : Nat) : Float {
      if (score >= 39) { 9.0 } else if (score >= 37) { 8.5 } else if (score >= 35) { 8.0 } else if (score >= 33) {
        7.5;
      } else if (score >= 30) { 7.0 } else if (score >= 27) { 6.5 } else if (score >= 23) { 6.0 } else if (score >= 19) {
        5.5;
      } else if (score >= 15) { 5.0 } else { 0.0 };
    };

    let estimatedBand = getBandEstimate(totalScore);

    (totalScore, totalCorrect, totalWrong, estimatedBand);
  };

  // Feedback
  public shared ({ caller }) func submitFeedback(creds : AuthCredentials, responseId : Nat, feedbackText : Text) : async () {
    if (not authenticateUser(creds)) {
      Runtime.trap("Unauthorized: Invalid credentials");
    };

    let ?response = responses.get(responseId) else {
      Runtime.trap("Student response not found");
    };

    let feedback = {
      text = feedbackText;
      submittedBy = creds.username;
    };

    let updatedResponse = { response with feedback = ?feedback };
    responses.add(responseId, updatedResponse);
  };

  // Response viewer panel logic
  module StudentResponse {
    public func compareByTimestamp(response1 : StudentResponse, response2 : StudentResponse) : { #less; #greater; #equal } {
      Int.compare(response2.submissionTimestamp, response1.submissionTimestamp);
    };
  };

  public query ({ caller }) func getResponsesByTest(testId : Nat) : async [StudentResponse] {
    responses.values().toArray().filter(
      func(response) {
        response.testId == testId;
      }
    );
  };

  public query ({ caller }) func getResponsesByBatch(batchNumber : Text) : async [StudentResponse] {
    responses.values().toArray().filter(
      func(response) {
        response.batchNumber == batchNumber;
      }
    );
  };

  public query ({ caller }) func searchResponsesByName(searchTerm : Text) : async [StudentResponse] {
    responses.values().toArray().filter(
      func(response) {
        response.studentName.contains(#text searchTerm);
      }
    );
  };

  public query ({ caller }) func getSortedResponses() : async [StudentResponse] {
    responses.values().toArray().map(func(x) { x }).sort(StudentResponse.compareByTimestamp);
  };

  // Helper method to invalidate responses associated with a deleted test
  func invalidateResponsesForTest(testId : Nat) {
    let responsesToUpdate = responses.filter(
      func(_id, response) {
        response.testId == testId;
      }
    );

    responsesToUpdate.forEach(
      func(_id, _response) {
        responses.remove(_id);
      }
    );
  };
};

