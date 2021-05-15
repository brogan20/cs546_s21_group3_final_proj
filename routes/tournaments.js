const express = require('express');
const router = express.Router();
const data = require('../data');
const tournamentData = data.tournaments;
const matchData = data.matches
const charData = data.characters

router.get('/', async (req, res) => {
    try {
        var tournaments = await tournamentData.getAllTournaments();
    } catch (e) {
        res.render('others/404error', {pageTitle: "404", error: "Tournaments not found"});
        return;
    }
    res.render('others/alltournaments', {pageTitle: "Tournament Profiles", tournaments: tournaments});
});

router.get('/:id', async (req, res) => {
    try {
        var tournament = await tournamentData.getOneTournament(req.params.id);
    } catch (e) {
        res.render('others/404error', {pageTitle: "404", error: `Tournament ${req.params.id} not found`});
        return;
    }

    let matches;
    let users;
    let mostPlayed;
    for(const elem of tournament.players){
        users[elem] = [0,0]
        mostPlayed[elem]
    }
    for(const elem of tournament.matches){
        try{
            let match = await matchData.getMatch(elem.toString());
            match.winnerPlayedDisplay = charData.charNameMap[match.winnerPlayed]
            match.loserPlayedDisplay = charData.charNameMap[match.loserPlayed]
            users[match.winner][0] += 1;
            users[match.loser][1] += 1;
            mostPlayed[match.winner][match.winnerPlayed] = mostPlayed[match.winner].hasOwnProperty(match.winnerPlayed) ? mostPlayed[match.winner][match.winnerPlayed] += 1 : 1
            matches.push(match);
        }
        catch{
            continue;
        }
    }

    for(const elem of mostPlayed){
        elem["final"] = elem.entries().reduce((a,b) => a[1] > b[1] ? a : b)[0];
    }
    for(elem of users){
        elem[3] = elem[0]/(elem[0] + elem[1]);
    }
    res.render('others/tournament', {pageTitle: `Tournament: ${req.params.id}`, tournament: tournament, users: users, matches: matches});
});

router.post('/', async (req, res) => {
    let tournamentInfo = req.body;
    if (!tournamentInfo) {
        res.render('others/400error', {pageTitle: "400", error: "Tournament info not supplied"});
        return;
    }
    if (!tournamentInfo.matches || !Arrays.isArray(tournamentInfo.matches)) {
        res.render('others/400error', {pageTitle: "400", error: "Tournament matches not supplied"});
        return;
    }
    if (!tournamentInfo.players || !Arrays.isArray(tournamentInfo.players)) {
        res.render('others/400error', {pageTitle: "400", error: "Tournament players not supplied"});
        return;
    }

    try {
        const tournament = await tournamentData.getTournament(tournamentInfo.matches, tournamentInfo.players);
        res.status(200).json(tournament);
    } catch (e) {
        res.render('others/400error', {pageTitle: "400", error: "Failed to add tournament"});
        return;
    }
});

module.exports = router;
