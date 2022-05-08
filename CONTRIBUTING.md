_Welcome, and thank you for contributing to this project. Please take your time to study this document carefully before making any changes to the codebase, to ensure you're on the same page with the rest of the team and we can all collaborate seamlessly._

# Workflow

This project uses the [Fork & Pull Model](https://help.github.com/en/articles/about-collaborative-development-models)
for receiving contributions. Read about the Fork & Pull Model
[here](https://help.github.com/en/articles/about-collaborative-development-models).

## Branch Structure

### Upstream

The main / original / upstream (hereinafter upstream) repository will have only two (2) branches - master and develop. Additional hotfix branches may be created to work on critical bugs in the deployment.

**'_master_' - Development branch.** This is where features from the feature branches are brought together. This is the default branch. An integration team will be responsible for bringing it all together and resolving any possible merge conflicts that may arise.

**'_release_' - Deployment / release branch.** The code on this branch goes live to our hosting servers and must be kept in pristine condition. When the integration (master) branch reaches a milestone, we create a new release branch with the version appended to the name. For example "release-v0.2.0"

**'_staging_' - Testing / staging branch** We use this to test all our shii

**'_hotfix'_ - Fixing branch** In the event that a bug slips past the integration team and makes it into deployment, a hotfix branch is created off of the latest release branch. Prefix hotfix branch names with "hf/" e.g "hotfix/kill-bird". On completion, this branch is merged with `release`, and also with `master` so the fixes are reflected in all future deployments.

**'_feature_' - Feature branch** You create a new branch when you are working on a specific feature. Prefix feature branch names with "feat/" e.g "feat/find-two-stones". The integration team will merge your branch into _staging_ first then if everthing checks out it will be merged into master. When `master` reaches a milestone, we will create a new `release` branch.

### Forks

Each fork represents work on a specific feature or task. Fork this repository to your own account and do all your work there. Create a feature branch or hotfix branch off of _master_ from your repo=. Check the Pivotal Tracker board for any tasks assigned to you or pick an issue to work on. then when you are done create a pull request to the `develop` branch of the main (upstream) repo.

### Staying Updated

When working with many people on the same codebase, sometimes others make changes that affect your work. While great care has been taken to create a modular team workflow to keep this to a minimum, merge conflicts are inevitable. It would _suck_ to finish working on a task or feature, only to find that the codebase has evolved and you need to rework everything to conform to the new changes. This is managed in two ways:

**_First_**, make sure your work is in line with our specifications. Understand the folder structure and stick to it. Study the tasks list on Pivotal Tracker and identify any tasks that your work may depend on or that relates to yours in some way. Contact the team leads or project managers if you need any clarification. Do your due dilligence to make sure you are on the same page with everyone else. This is your responsibility. Your submission may be rejected if it's non-compliant.
**_Second_**, each team member needs to make sure that at every given time, their working directory is up-to-date with the latest changes from the upstream _develop_ branch. This is achieved with a two-fold process.

#### Pulling Upstream

After setting up your fork on github and cloning it locally on your system, you'll need to run a command just once to create a connection between your local repository and the remote upstream repository. Note that there's automatically a remote 'origin' repository set up when you clone. This points to your fork. Now you need to set up 'upstream' which will point to the central upstream repo.

0. Open a terminal and go into the directory for the newly cloned repo. Now add the upstream remote like so:
    <pre>git remote add upstream git://github.com/TEAM-NAME/REPO-NAME.git</pre>
   PS: _You may get an error saying the `upstream` remote has already been configured. If so, then you are good to go._

Now you're all set up.
**_The following steps must be run periodically to keep your work up-to-date! You can run these commands as often as every hour. You want to fetch any new changes as soon as possible. Each time you want to begin working, or take a break from your work, run these first._**
Be sure to [stash](https://dev.to/neshaz/how-to-git-stash-your-work-the-correct-way-cna)
or commit all local changes first.

1. Switch to the develop branch
   <pre>git checkout develop</pre>
2. Get all remote upstream changes into your local computer.
   <pre>git pull upstream develop</pre>
3. Push the newly merged changes to your fork's remote (online) repo. This is configured as 'origin' by default.
   <pre>git push origin develop</pre>

If you've created a new branch to work on rather than working directly on `develop`, then run the next steps.

5. Switch to your feature branch.
   <pre>git checkout your-feature-branch</pre>
6. Merge the changes on the newly merged develop branch, into your feature branch. After you must have pulled from
   upstream.

   <pre>git merge develop</pre>

   _You may encounter merge conflicts here.
   [Resolve them](https://help.github.com/en/articles/resolving-a-merge-conflict-using-the-command-line),
   then come back and complete the merge. If you merge often enough, any conflicts would be trivial and very few._

7. Finally, push your newly merged feature branch to the remote github server for backup.
   <pre>git push origin your-feature-branch</pre>

### FOLDER STRUCTURE

**classes** – This is where our classes live. Every actor in the game usually will have its own class. Like the "Ball" or "Referee" actors. They are characters in the game.

**controllers** – Here we have things that interact with the outside world. Like the "game-controller"

**state** – This folder holds our state. Will probably be renamed and better defined later.

**helpers** – Reusable code that is not part of core game functionality. Like the response handler.

**interfaces** – Has all the interfaces we need for our game entities.

**middleware** – validators and all the like

**models** – These are database collections/tables and they define an object. Players, Clubs are game entities that have their own model setup.

**routes** – This is the source of our `/api` routes

**services** – This folder will be used to interact with database and its models. Don’t call database collections/tables directly from the controllers, helpers or middlewares.

**utils** – Reusable code that is essential to game functionality. Like the functions that determine a players blokc position.

**./server.ts** where the magic happens

<!-- **test** – Mocha test files through Chai assertion library. - comming soon -->

### Writing le code
Use these labels in addition to TODO in your comments
FIXME:	something is broken
HACK/OPTIMIZE:	the code is suboptimal and should be refactored
BUG:	there is a bug in the code
CHECKME/REVIEW:	the code needs to be reviewed
DOCME:	the code needs to be documented (either in codebase or external documentation)
TESTME:	the specified code needs to be tested or that tests need to be written for that selection o
from [https://goldin.io/blog/stop-using-todo](https://goldin.io/blog/stop-using-todo)

### VS CODE

**Install Plugins** – Below plugins is recommende for installation

1. ESLint
2. Prettier
3. Editor Config For VS Code

We expect that all team members use VS Code as we have a .editorconfig file that helps all team members maintain a similar code structure

### NAMING CONVENTION

Every team member should adhere to pascalCase naming for all variables and functions. Class names should start with capital letters, interface names should start with 'I' then a capital letter. Use sensible and understandable names fot function names. Name's of class files should start with capital letter. Follow the pattern already existing.

### CODE COMMENTS

Comment your code to add descriptions only. Keep it short and simple. Don't put too many comments in your code.

### RESOLVING MERGE CONFLICTS

Files coming from the develop branch are not to be adjusted or modified without prior notice to the team or TL. If you feel a function or line should be changed, discuss with the team or TL first and state your rational behind the change.

### COMMITING YOUR WORK

Endeavour to have at most 2 commits when you are raising PR, you must squash all your other commits.

#### Most of all don't forget to enjoy yourself in this codebase, run wild! I am grateful for your assistance. Let's see the delightful things you come up with. _Do Great Things_ , _The Bird must die_ ( ͡ᵔ ͜ʖ ͡ᵔ )

- LeanKhan :)

### Important...

So you might need images for your clubs and for the app. Download this .zip file and unpack it in the /assets folder (create it if not there already).
So that you have assets/img/... don't forget to move the img folder inside the zip to the assets folder gan

This folder has the game logo and club logos. Of course, you can use your own club logos.

The folder: https://drive.google.com/file/d/1ZohZLDTaT9owSKY_OWA7Y5UgBqvghR0q/view?usp=sharing
