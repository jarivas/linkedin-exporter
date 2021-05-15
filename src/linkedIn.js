/* Heavily inspired by the extinct VeloCv plugin */
const fileName = 'linkedIn-clean.json'
const host = "https://www.linkedin.com"
const apiPath = "/voyager/api/identity/profiles/me"
const apiUrl = host + apiPath + "/"
const pagination = "start=0&count=100"
const headers = {
    'Content-Type': 'application/json',
    'csrf-token': 'ReplaceMe',
    'x-restli-protocol-version': '2.0.0'
}
const options = {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: headers
}
const profiles = new Map()

fetch(apiUrl + "profileView", options)
    .then(response => response.json())
    .then(processProfileMultiLanguage)

async function processProfileMultiLanguage(profile) {
    const p = profile.profile
    const promises = []

    for (let i = 0; i < p.supportedLocales.length; i++) {
        promises.push(process(p.supportedLocales[i].language, p.supportedLocales[i].country))
    }

    Promise.all(promises).then(download)
}

async function process(l, c) {
    return fetch(apiUrl + "profileView?locale=(language:" + l + ",country:" + c + ")&vlanguage=" + l + "&vcountry=" + c,
        options)
        .then(response => response.json())
        .then(async profile => {

            await processCertifications(profile, l, c)
            await processCourses(profile, l, c)
            await processEducations(profile, l, c)

            delete profile.entityLocale
            delete profile.entityUrn

            await processHonors(profile, l, c)
            await processLanguages(profile, l, c)
            await processOrganizations(profile,l , c)
            await processPatents(profile, l, c)

            delete profile.positionGroupView

            await processPositions(profile, l, c)

            processProfile(profile.profile)

            await processProfileContactInfo(profile, l, c)

            delete profile.primaryLocale

            await processProjects(profile, l, c)
            await processPublications(profile, l, c)
            await processRecommendations(profile, l, c)
            await processSkills(profile, l, c)

            delete profile.summaryTreasuryMediaCount
            delete profile.summaryTreasuryMedias

            await processTestScores(profile, l, c)
            await processVolunteerCauses(profile, l, c)
            await processVolunteerExperiences(profile, l, c)

            profiles.set(l, profile)
        })
}

async function processCertifications(profile, language, country) {
    return fetch(apiUrl + "certifications?" + pagination + "&locale=(language:" + language + ",country:" + country + ")&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(certifications => {
            const elements = certifications.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]

                delete (e.company)
                delete (e.companyUrn)
                delete (e.entityUrn)
            }

            profile.certificationView = elements
        })
}

async function processCourses(profile, language, country) {
    return fetch(apiUrl + "courses?" + pagination + "&locale=(language:" + language + ",country:" + country + ")&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(courses => {
            const elements = courses.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
                delete (e.occupation)
            }

            profile.courseView = elements
        })
}

async function processEducations(profile, language, country) {
    return fetch(apiUrl + "educations?" + pagination + "&locale=(language:" + language + ",country:" + country + ")&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(educations => {
            const elements = educations.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]

                delete (e.entityUrn)
                delete (e.entityLocale)
                delete (e.fieldOfStudyUrn)
                delete (e.recommendations)

                e.timePeriod = e.timePeriod.startDate.year + ' - ' + e.timePeriod.endDate.year
            }

            profile.educationView = elements
        })
}

async function processHonors(profile, language, country) {
    return fetch(apiUrl + "honors?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(honors => {
            const elements = honors.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.honorView = elements
        })
}

async function processLanguages(profile, language, country) {
    return fetch(apiUrl + "languages?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(languages => {
            const elements = languages.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.languageView = elements
        })
}

async function processOrganizations(profile, language, country) {
    return fetch(apiUrl + "organizations?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(organizations => {
            const elements = organizations.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.organizationView = elements
        })
}

async function processPatents(profile, language, country) {
    return fetch(apiUrl + "patents?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(patents => {
            const elements = patents.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.patentView = elements
        })
}

async function processPositions(profile, language, country) {

    return fetch(apiUrl + "positions?" + pagination + "&locale=(language:" + language + ",country:" + country + ")&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(positions => {
            const elements = positions.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]

                delete (e.entityUrn)
                delete (e.companyUrn)
                delete (e.geoUrn)
                delete (e.region)

                if(e.hasOwnProperty('courses')) {
                    delete (e.courses)
                }

                delete (e.entityLocale)
                delete (e.recommendations)

                if (e.hasOwnProperty('company')){
                    e.company = e.company.miniCompany.name
                }

                if (e.timePeriod.startDate &&  e.timePeriod.endDate) {
                    e.timePeriod = e.timePeriod.startDate.year + '.' + e.timePeriod.startDate.month + ' - ' +
                        e.timePeriod.endDate.year + '.' + e.timePeriod.endDate.month
                } else if (e.timePeriod.startDate) {
                    e.timePeriod = e.timePeriod.startDate.year + '.' + e.timePeriod.startDate.month + ' - '
                }
            }

            profile.positionView = elements
        })
}

function processProfile(profile) {
    delete (profile.entityUrn)
    delete (profile.defaultLocale)
    delete (profile.elt)
    delete (profile.entityLocale)
    delete (profile.geoCountryUrn)
    delete (profile.geoLocation)
    delete (profile.geoLocationBackfilled)
    delete (profile.industryUrn)
    delete (profile.miniProfile)
    delete (profile.supportedLocales)
    delete (profile.versionTag)
    delete (profile.profilePicture)
    delete (profile.profilePictureOriginalImage)
    delete (profile.showEducationOnProfileTopCard)
    delete (profile.location)
}

async function processProfileContactInfo(profile, language, country) {
    return fetch(apiUrl + "profileContactInfo?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(async info => {
            delete (info.entityUrn)
            delete (info.birthdayVisibilitySetting)

            const websites = info.websites

            for (let i = 0; i < websites.length; ++i) {
                delete(websites[i].type)
            }

            profile.profileContactInfo = info
        })
}

async function processProjects(profile, language, country) {

    return fetch(apiUrl + "projects?" + pagination + "&locale=(language:" + language + ",country:" + country + ")&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(projects => {
            const elements = projects.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.projectView = elements
        })
}

async function processPublications(profile, language, country) {
    return fetch(apiUrl + "publications?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(publications => {
            const elements = publications.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.publicationView = elements
        })
}

async function processRecommendations(profile, language, country) {
    return fetch(apiUrl + "recommendations?" + pagination + "&q=received&recommendationStatuses=List(VISIBLE)&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(recommendations => {
            const elements = recommendations.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.publicationView = elements
        })
}

async function processSkills(profile, language, country) {
    return fetch(apiUrl + "skills?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(skills => {
            const elements = skills.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.skillView = elements
        })
}

async function processTestScores(profile, language, country) {
    return fetch(apiUrl + "testScores?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(testScores => {
            const elements = testScores.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.testScoreView = elements
        })
}

async function processVolunteerCauses(profile, language, country) {
    return fetch(apiUrl + "volunteerCauses?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(volunteerCauses => {
            const elements = volunteerCauses.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.volunteerCauseView = elements
        })
}

async function processVolunteerExperiences(profile, language, country) {
    return fetch(apiUrl + "volunteerExperiences?" + pagination + "&vlanguage=" + language + "&vcountry=" + country,
        options)
        .then(response => response.json())
        .then(volunteerExperiences => {
            const elements = volunteerExperiences.elements

            for (let i = 0; i < elements.length; ++i) {
                const e = elements[i]
                delete (e.entityUrn)
            }

            profile.volunteerExperienceView = elements
        })
}

function mapToObj(map){
    var obj = {}
    map.forEach(function(v, k){
        obj[k] = v
    })
    return obj
}

function download() {
    const obj = {
        profiles: mapToObj(profiles)
    }
    const content = JSON.stringify(obj, null, 2)
    const fileType = 'application/json'

    const blob = new Blob([content], {type: fileType})


    const a = document.createElement('a');
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(':')
    a.style.display = "none"

    document.body.appendChild(a)

    a.click()

    document.body.removeChild(a)

    setTimeout(function () {
        URL.revokeObjectURL(a.href)
    }, 1500)
}