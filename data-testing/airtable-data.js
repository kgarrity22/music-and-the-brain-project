var Airtable = require('airtable');
var base = new Airtable({apiKey: }).base();
//TRIALS SETS
var phases_set = new Set();
var status_set = new Set();
var purpose_set = new Set();
var type_set = new Set();
var randomization_set = new Set();
var masking_set = new Set();
//POPULATIONS SETS
var ageGroups_set = new Set();
var healthyVolunteers_set = new Set();
var singleMultiSite_set = new Set();
var targEnrollment_set = new Set();
var settings_set = new Set();


//INTERVENTIONS SETS
var intervention_set = new Set();

var drugs_set = new Set();
var devices_set = new Set();
var drugs_set = new Set();
var biological_set = new Set();
var procedures_set = new Set();
var radiation_set = new Set();
var behavioral_set = new Set();
var genetic_set = new Set();
var dietarySupplements_set = new Set();
var combProds_set = new Set();
var diagnostic_set = new Set();
var otherInt_set = new Set();

// OUTCOMES SETS
var outcomes_set = new Set();

//SPONSORS SETS
// ****Looks like this is just one level? - check on this
var sponsors_set = new Set();

//GEOGRAPHY SETS
var regions_set = new Set();
var regions_list = []
var countries_list = []



//TRIALS DICTIONARIES
var unique_phases = {};
var unique_status = {};
var unique_purpose = {};
var unique_type = {};
var unique_random = {};
var unique_masking = {};

//POPULATIONS DICTIONARIES
var unique_ageGroups = {};
var unique_healthyVolunteers = {};
var unique_singleMultiSite = {};
var unique_targEnrollment = {};
var unique_settings = {};

//INTERVENTIONS DICTIONARIES
var unique_interventions = {};

var unique_drugs = {};
var unique_devices = {};
var unique_drugs = {};
var unique_biological = {};
var unique_procedures = {};
var unique_radiation = {};
var unique_behavioral = {};
var unique_genetic = {};
var unique_dietarySupplements = {};
var unique_combProds = {};
var unique_diagnostic = {};
var unique_otherInt = {};

// OUTCOMES DICTIONARIES
var unique_outcomes = {};

// SPONSORS DICTIONARIES
var unique_sponsors = {};


// GEOGRAPHY DICTIONARIES
var unique_regions = {};



var trials_filts = {};
var populations_filts = {};
var interventions_filts = {};
var outcome_filts = {};
var sponsor_filts = {};
var geography_filts = {}

function create_filter_dict(set, unique_dict){
  for (var i of set) {

      i = String(i)
      unique_dict[i] = true;

  }
}

var filters = "NOT(OR({Phase} = 'Phase 1'))"
// see which filters are set to false
// if the filter is set to false
//

function getairtable() {

  return new Promise((resolve, reject) => {
    base('Trials').select({
        // Selecting the first 3 records in Raw View:
        // maxRecords: 3,
        filterByFormula: filters,

        view: "Raw View",

    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.


        records.forEach(function(record) {
          // TRIALS FILTERS
          phases_set.add(record.get('Phase'))
          status_set.add(record.get('Status'))
          purpose_set.add(record.get('Purpose'))
          type_set.add(record.get('Study_Type'))
          randomization_set.add(record.get('Randomization'))
          masking_set.add(record.get('Masking_Clean'))
          // console.log("hERE!")

          // POPULATIONS FILTERS

          var age = record.get('Age_Groups')[0].split(", ")
          for (var item of age){
            //console.log("item: ", item)
            ageGroups_set.add(item)
          }
          healthyVolunteers_set.add(record.get('Healthy_Volunteers'))
          singleMultiSite_set.add(record.get('Single_Multi_Site'))
          targEnrollment_set.add(record.get('Enrollment_Target'))

          var settings = record.get('Facility_Settings')
          //console.log("settings: ", settings)
          if (typeof(settings)==='object'){
            for (var item of settings){
              //console.log("item: ", item)
              settings_set.add(item)
            }
          } else {
            settings_set.add(settings)
          }




          // INTERVENTIONS FILTERS
          // this one will take more figuring out
          // var inter = record.get('Intervention_Types')
          // console.log("one intervention: ", inter.split(", "))
          var interventions = record.get('Intervention_Types').split(", ")
          for (var item of interventions){
            intervention_set.add(item)
          }



          // OUTCOMES FILTERS

          var outcome = record.get('Outcome_Concepts')
          if (typeof(outcome)==='object'){
            for (var item of outcome){
              if (item === null){
                outcomes_set.add(null)
              } else {
                var itemlist = item.split(", ")
                for (var j of itemlist){
                  outcomes_set.add(j)
                }
              }
            }
          } else {
            outcomes_set.add(outcome)
          }



          // SPONSORS FILTERS
          sponsors_set.add(record.get('Sponsor_Type'))


          // GEOGRAPHY FILTERs
          regions_set.add(record.get('Geography_Regions'))
          regions_list.push(record.get('Geography_Regions'))
          countries_list.push(record.get('Geography_Countries'))


        });
        //console.log("pahses: ", phases_set)


        // To fetch the next page of records, call `fetchNextPage`.
        // If there are more records, `page` will get called again.
        // If there are no more records, `done` will get called.
        fetchNextPage();

    }, function done(err) {
        if (err) {
          console.error(err);
          return reject({});
        }
        console.log("DID we ever make it here?")

        // TRIALS
        create_filter_dict(phases_set, unique_phases)
        create_filter_dict(status_set, unique_status)
        create_filter_dict(purpose_set, unique_purpose)
        create_filter_dict(type_set, unique_type)
        create_filter_dict(randomization_set, unique_random)
        create_filter_dict(masking_set, unique_masking)


        trials_filts["Type"] = unique_type;
        trials_filts["Status"] = unique_status;
        trials_filts["Purpose"] = unique_purpose;
        trials_filts["Randomization"] = unique_random;
        trials_filts["Masking"] = unique_masking;
        trials_filts["Phase"] = unique_phases;

        // POPULATIONS
        create_filter_dict(ageGroups_set, unique_ageGroups)
        create_filter_dict(healthyVolunteers_set, unique_healthyVolunteers)
        create_filter_dict(singleMultiSite_set, unique_singleMultiSite)
        create_filter_dict(targEnrollment_set, unique_targEnrollment)
        create_filter_dict(settings_set, unique_settings)


        populations_filts["Age Groups"] = unique_ageGroups;
        populations_filts["Healthy Volunteers"] = unique_healthyVolunteers;
        populations_filts["Single/Multi Site"] = unique_singleMultiSite;
        populations_filts["Target Enrollment"] = unique_targEnrollment;
        populations_filts["Settings"] = unique_settings;


        // INTERVENTIONS
        create_filter_dict(intervention_set, unique_interventions)


        interventions_filts["Interventions"] = unique_interventions


        // OUTCOMES
        create_filter_dict(outcomes_set, unique_outcomes)


        outcome_filts["Outcomes"] = unique_outcomes


        // SPONSORS

        create_filter_dict(sponsors_set, unique_sponsors)


        sponsor_filts["Sponsors"] = unique_sponsors


        // GEOGRAPHY
        //console.log('regions list length: ', regions_list.length)
        for (var i=0; i < regions_list.length; i++) {

          // if the region is in the geography list
          //console.log("keys: ", Object.keys(unique_regions))

          var regIndex = Object.keys(unique_regions).indexOf(regions_list[i])

          if (regIndex!==-1) {
            // is the matching country a key in the values
            //console.log("is this actually a thing: ", Object.keys(Object.values(unique_regions)[regIndex]).contains(countries_list[i]))
            if (!Object.keys(Object.values(unique_regions)[regIndex]).contains(countries_list[i])) {
              // if it's not, add it
              unique_regions[regions_list[i]][countries_list[i]] = true;
            }
          } else {
            // if not, add it
            // make the region a key
            // make the country a key value pair as the value

            var country = countries_list[i][0]
            //console.log("unique region list: ", unique_regions[regions_list[i][0]])
            unique_regions[regions_list[i][0]] = {}
            unique_regions[regions_list[i][0]][country] = true
            //console.log("being added to unique: ", regions_list[i][0], " : ", country)
          }
        }


        geography_filts["Regions"] = unique_regions
        //console.log("UNIQUE regions: ", unique_regions)





        var result = {}
        result["trials"] = trials_filts
        result["populations"] = populations_filts
        result["interventions"] = interventions_filts
        result["outcomes"] = outcome_filts
        result["sponsors"] = sponsor_filts
        result["geography"] = geography_filts
        //console.log("HOWs THIS LOOK: ", trials_filts)


        resolve(result);
        //
    });



  })


}// end of promise


async function asyncCall() {
  console.log('calling');
  const results = await getairtable();
  console.log("RESULT: ", results);
  // expected output: "resolved"
}

asyncCall()
